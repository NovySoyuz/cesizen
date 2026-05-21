package com.cesizen.cesizenapi.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    private static final String SECRET = "cesizen-super-secret-key-for-tests-min-256bits!!";
    private static final long EXPIRATION = 86400000L; // 24h

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(jwtUtil, "jwtExpirationMs", EXPIRATION);
    }

    private UserDetails buildUser(String email, String role) {
        return new User(email, "hashedpassword",
                List.of(new SimpleGrantedAuthority("ROLE_" + role)));
    }

    // ─── generateToken ────────────────────────────────────────────

    @Test
    @DisplayName("generateToken - doit retourner un token non nul")
    void generateToken_shouldReturnNonNullToken() {
        UserDetails user = buildUser("eric@example.com", "USER");
        String token = jwtUtil.generateToken(user);
        assertThat(token).isNotNull().isNotBlank();
    }

    @Test
    @DisplayName("generateToken - le token doit contenir 3 parties séparées par un point")
    void generateToken_shouldBeValidJwtFormat() {
        UserDetails user = buildUser("eric@example.com", "USER");
        String token = jwtUtil.generateToken(user);
        assertThat(token.split("\\.")).hasSize(3);
    }

    // ─── extractEmail ─────────────────────────────────────────────

    @Test
    @DisplayName("extractEmail - doit retourner l'email de l'utilisateur")
    void extractEmail_shouldReturnCorrectEmail() {
        UserDetails user = buildUser("eric@example.com", "USER");
        String token = jwtUtil.generateToken(user);
        assertThat(jwtUtil.extractEmail(token)).isEqualTo("eric@example.com");
    }

    // ─── isTokenValid ─────────────────────────────────────────────

    @Test
    @DisplayName("isTokenValid - doit retourner true pour un token valide")
    void isTokenValid_shouldReturnTrueForValidToken() {
        UserDetails user = buildUser("eric@example.com", "USER");
        String token = jwtUtil.generateToken(user);
        assertThat(jwtUtil.isTokenValid(token, user)).isTrue();
    }

    @Test
    @DisplayName("isTokenValid - doit retourner false si l'email ne correspond pas")
    void isTokenValid_shouldReturnFalseForWrongUser() {
        UserDetails user = buildUser("eric@example.com", "USER");
        UserDetails otherUser = buildUser("autre@example.com", "USER");
        String token = jwtUtil.generateToken(user);
        assertThat(jwtUtil.isTokenValid(token, otherUser)).isFalse();
    }

    @Test
    @DisplayName("isTokenValid - doit retourner false pour un token expiré")
    void isTokenValid_shouldReturnFalseForExpiredToken() {
        // Token avec expiration immédiate (1ms)
        ReflectionTestUtils.setField(jwtUtil, "jwtExpirationMs", 1L);
        UserDetails user = buildUser("eric@example.com", "USER");
        String token = jwtUtil.generateToken(user);

        // Attendre que le token expire
        try { Thread.sleep(10); } catch (InterruptedException ignored) {}

        assertThatThrownBy(() -> jwtUtil.isTokenValid(token, user))
                .isInstanceOf(Exception.class);
    }
}