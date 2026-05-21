package com.cesizen.cesizenapi.service;

import com.cesizen.cesizenapi.dto.AuthResponseDTO;
import com.cesizen.cesizenapi.dto.LoginRequestDTO;
import com.cesizen.cesizenapi.dto.RegisterRequestDTO;
import com.cesizen.cesizenapi.model.Utilisateur;
import com.cesizen.cesizenapi.repository.UtilisateurRepository;
import com.cesizen.cesizenapi.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
// Logique metier du register et du login
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    // ─── Register ─────────────────────────────────────────────────
    public AuthResponseDTO register(RegisterRequestDTO request) {

        // 1. Vérifie si l'email est déjà utilisé
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        // 2. Crée l'utilisateur avec le mot de passe hashé
        Utilisateur utilisateur = Utilisateur.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .build();

        // 3. Sauvegarde en BDD
        utilisateurRepository.save(utilisateur);

        // 4. Génère le token JWT
        UserDetails userDetails = userDetailsService.loadUserByUsername(utilisateur.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        // 5. Retourne la réponse
        return new AuthResponseDTO(
                token,
                utilisateur.getId(),
                utilisateur.getNom(),
                utilisateur.getPrenom(),
                utilisateur.getEmail(),
                utilisateur.getRole().name()
        );
    }

    // ─── Login ────────────────────────────────────────────────────
    public AuthResponseDTO login(LoginRequestDTO request) {

        // 1. Vérifie email + mot de passe (lance une exception si invalide)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getMotDePasse()
                )
        );

        // 2. Charge l'utilisateur depuis la BDD
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // 3. Génère le token JWT
        UserDetails userDetails = userDetailsService.loadUserByUsername(utilisateur.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        // 4. Retourne la réponse
        return new AuthResponseDTO(
                token,
                utilisateur.getId(),
                utilisateur.getNom(),
                utilisateur.getPrenom(),
                utilisateur.getEmail(),
                utilisateur.getRole().name()
        );
    }
}