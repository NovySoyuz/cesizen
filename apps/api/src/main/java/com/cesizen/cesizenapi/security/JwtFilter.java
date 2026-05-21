package com.cesizen.cesizenapi.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    // Intercepte chaque requete HTTP avant d'atteindre le controller
    // Il lit le token dans le header, le valide, et dit à Spring Security que l'utilisateur est authentifié pour cette requete
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // ─── 1. Récupère le header Authorization ─────────────────
        final String authHeader = request.getHeader("Authorization");

        // ─── 2. Si pas de token ou mauvais format → on passe ─────
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // ─── 3. Extrait le token (on enlève "Bearer ") ────────────
        final String token = authHeader.substring(7);

        // ─── 4. Extrait l'email depuis le token ───────────────────
        final String email = jwtUtil.extractEmail(token);

        // ─── 5. Si email trouvé et pas encore authentifié ────────
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // ─── 6. Vérifie que le token est valide ───────────────
            if (jwtUtil.isTokenValid(token, userDetails)) {

                // ─── 7. Crée l'objet d'authentification ──────────
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // ─── 8. Enregistre l'utilisateur dans le contexte Spring Security
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // ─── 9. Passe la requête au controller ────────────────────
        filterChain.doFilter(request, response);
    }
}