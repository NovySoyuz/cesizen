package com.cesizen.cesizenapi.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    // ─── Génère la clé de signature à partir du secret ───────────
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // ─── Génère un token pour un utilisateur ─────────────────────
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())       // email de l'utilisateur
                .claim("roles", userDetails.getAuthorities()) // ROLE_USER ou ROLE_ADMIN
                .issuedAt(new Date())                     // date de création
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs)) // expiration (1h) application.properties
                .signWith(getSigningKey())                 // signature avec la clé secrète
                .compact();                               // construit la chaîne JWT
    }

    // ─── Extrait l'email depuis le token ─────────────────────────
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    // ─── Vérifie que le token est valide ─────────────────────────
    // La verification est fait uniquement sur les routes protégées par spring security
    // par exemple pas la peine de proteger la route pour se connecter, register
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // ─── Vérifie si le token est expiré ──────────────────────────
    // le front va gerer la deconnexion car le serveur reçoit une 401
    private boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    // ─── Décode et retourne le contenu du token ──────────────────
    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}