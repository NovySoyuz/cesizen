package com.cesizen.cesizenapi.controller;

import com.cesizen.cesizenapi.model.Utilisateur;
import com.cesizen.cesizenapi.repository.DiagnosticRepository;
import com.cesizen.cesizenapi.repository.UtilisateurRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private DiagnosticRepository diagnosticRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        // Supprime d'abord les diagnostics (FK vers utilisateur) pour éviter
        // les violations de contrainte entre classes de test partageant la même DB H2.
        diagnosticRepository.deleteAll();
        utilisateurRepository.deleteAll();
    }

    // ─── POST /api/auth/register ──────────────────────────────────

    @Test
    @DisplayName("register - 201 avec token si données valides")
    void register_shouldReturn201WithToken() throws Exception {
        Map<String, String> body = Map.of(
                "nom", "Dupont",
                "prenom", "Eric",
                "email", "eric@example.com",
                "motDePasse", "motdepasse123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("eric@example.com"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("register - 400 si email déjà utilisé")
    void register_shouldReturn400IfEmailExists() throws Exception {
        // Crée un utilisateur en BDD
        utilisateurRepository.save(Utilisateur.builder()
                .nom("Dupont").prenom("Eric")
                .email("eric@example.com")
                .motDePasse(passwordEncoder.encode("motdepasse123"))
                .build());

        Map<String, String> body = Map.of(
                "nom", "Autre",
                "prenom", "User",
                "email", "eric@example.com",
                "motDePasse", "motdepasse123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("déjà utilisé")));
    }

    @Test
    @DisplayName("register - 400 si données invalides")
    void register_shouldReturn400IfInvalidData() throws Exception {
        Map<String, String> body = Map.of(
                "nom", "",
                "prenom", "Eric",
                "email", "pasunemail",
                "motDePasse", "123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.nom").exists())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.motDePasse").exists());
    }

    // ─── POST /api/auth/login ─────────────────────────────────────

    @Test
    @DisplayName("login - 200 avec token si credentials valides")
    void login_shouldReturn200WithToken() throws Exception {
        // Crée l'utilisateur en BDD
        utilisateurRepository.save(Utilisateur.builder()
                .nom("Dupont").prenom("Eric")
                .email("eric@example.com")
                .motDePasse(passwordEncoder.encode("motdepasse123"))
                .build());

        Map<String, String> body = Map.of(
                "email", "eric@example.com",
                "motDePasse", "motdepasse123"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("login - 401 si mauvais mot de passe")
    void login_shouldReturn401ForWrongPassword() throws Exception {
        utilisateurRepository.save(Utilisateur.builder()
                .nom("Dupont").prenom("Eric")
                .email("eric@example.com")
                .motDePasse(passwordEncoder.encode("motdepasse123"))
                .build());

        Map<String, String> body = Map.of(
                "email", "eric@example.com",
                "motDePasse", "mauvaismdp"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("login - 401 si email inexistant")
    void login_shouldReturn401ForUnknownEmail() throws Exception {
        Map<String, String> body = Map.of(
                "email", "inconnu@example.com",
                "motDePasse", "motdepasse123"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());
    }
}