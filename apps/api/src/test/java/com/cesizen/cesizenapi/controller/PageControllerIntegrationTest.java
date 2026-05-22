package com.cesizen.cesizenapi.controller;

import com.cesizen.cesizenapi.model.Page;
import com.cesizen.cesizenapi.model.Utilisateur;
import com.cesizen.cesizenapi.repository.PageRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PageControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private PageRepository pageRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private Page page;
    private String tokenUser;
    private String tokenAdmin;

    @BeforeEach
    void setUp() throws Exception {
        pageRepository.deleteAll();
        utilisateurRepository.deleteAll();

        // Crée une page de test
        page = pageRepository.save(Page.builder()
                .titre("Accueil")
                .slug("accueil")
                .contenu("Bienvenue sur CESIZen")
                .estActif(true)
                .build());

        // Crée un USER
        utilisateurRepository.save(Utilisateur.builder()
                .nom("User").prenom("Test")
                .email("user@test.com")
                .motDePasse(passwordEncoder.encode("password123"))
                .role(Utilisateur.Role.USER)
                .build());

        // Crée un ADMIN
        utilisateurRepository.save(Utilisateur.builder()
                .nom("Admin").prenom("Test")
                .email("admin@test.com")
                .motDePasse(passwordEncoder.encode("password123"))
                .role(Utilisateur.Role.ADMIN)
                .build());

        // Récupère les tokens
        tokenUser = getToken("user@test.com", "password123");
        tokenAdmin = getToken("admin@test.com", "password123");
    }

    private String getToken(String email, String password) throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", email,
                                "motDePasse", password
                        ))))
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(response).get("token").asText();
    }

    // ─── GET /api/pages ───────────────────────────────────────────

    @Test
    @DisplayName("GET /api/pages - 200 sans token (public)")
    void getAllPages_shouldReturn200WithoutToken() throws Exception {
        mockMvc.perform(get("/api/pages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].slug").value("accueil"));
    }

    @Test
    @DisplayName("GET /api/pages - ne retourne pas les pages inactives")
    void getAllPages_shouldNotReturnInactivePages() throws Exception {
        pageRepository.save(Page.builder()
                .titre("Cachée").slug("cachee")
                .contenu("contenu").estActif(false).build());

        mockMvc.perform(get("/api/pages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    // ─── GET /api/pages/{slug} ────────────────────────────────────

    @Test
    @DisplayName("GET /api/pages/{slug} - 200 si slug existe")
    void getPageBySlug_shouldReturn200() throws Exception {
        mockMvc.perform(get("/api/pages/accueil"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titre").value("Accueil"))
                .andExpect(jsonPath("$.contenu").value("Bienvenue sur CESIZen"));
    }

    @Test
    @DisplayName("GET /api/pages/{slug} - 400 si slug inexistant")
    void getPageBySlug_shouldReturn400IfNotFound() throws Exception {
        mockMvc.perform(get("/api/pages/inexistant"))
                .andExpect(status().isBadRequest());
    }

    // ─── PUT /api/pages/{id} ──────────────────────────────────────

    @Test
    @DisplayName("PUT /api/pages/{id} - 200 si token ADMIN")
    void updatePage_shouldReturn200ForAdmin() throws Exception {
        Map<String, Object> body = Map.of(
                "titre", "Accueil modifié",
                "contenu", "Nouveau contenu",
                "estActif", true
        );

        mockMvc.perform(put("/api/pages/" + page.getId())
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titre").value("Accueil modifié"));
    }

    @Test
    @DisplayName("PUT /api/pages/{id} - 403 si token USER")
    void updatePage_shouldReturn403ForUser() throws Exception {
        Map<String, Object> body = Map.of(
                "titre", "Tentative",
                "contenu", "contenu",
                "estActif", true
        );

        mockMvc.perform(put("/api/pages/" + page.getId())
                        .header("Authorization", "Bearer " + tokenUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PUT /api/pages/{id} - 403 sans token")
    void updatePage_shouldReturn403WithoutToken() throws Exception {
        Map<String, Object> body = Map.of(
                "titre", "Tentative",
                "contenu", "contenu",
                "estActif", true
        );

        mockMvc.perform(put("/api/pages/" + page.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }
}