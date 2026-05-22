package com.cesizen.cesizenapi.controller;

import com.cesizen.cesizenapi.model.*;
import com.cesizen.cesizenapi.repository.*;
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

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DiagnosticControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private QuestionnaireRepository questionnaireRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private DiagnosticRepository diagnosticRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private Questionnaire questionnaire;
    private OptionReponse optionBien;
    private OptionReponse optionMal;
    private String tokenUser;

    @BeforeEach
    void setUp() throws Exception {
        diagnosticRepository.deleteAll();
        questionnaireRepository.deleteAll();
        utilisateurRepository.deleteAll();

        // ─── Crée un questionnaire complet ────────────────────────
        Question question = Question.builder()
                .libelle("Comment vous sentez-vous ?")
                .ordre(1)
                .build();

        optionBien = OptionReponse.builder().libelle("Bien").points(0).question(question).build();
        optionMal = OptionReponse.builder().libelle("Mal").points(10).question(question).build();
        question.setOptions(List.of(optionBien, optionMal));

        Interpretation interpFaible = Interpretation.builder()
                .scoreMin(0).scoreMax(5)
                .niveauStress("Stress faible")
                .messageResultat("Tout va bien.")
                .build();

        Interpretation interpEleve = Interpretation.builder()
                .scoreMin(6).scoreMax(10)
                .niveauStress("Stress élevé")
                .messageResultat("Consultez un professionnel.")
                .build();

        questionnaire = Questionnaire.builder()
                .titre("Test Stress")
                .description("Questionnaire de test")
                .estActif(true)
                .questions(List.of(question))
                .interpretations(List.of(interpFaible, interpEleve))
                .build();

        question.setQuestionnaire(questionnaire);
        interpFaible.setQuestionnaire(questionnaire);
        interpEleve.setQuestionnaire(questionnaire);

        questionnaire = questionnaireRepository.save(questionnaire);

        // Récupère les IDs réels des options après sauvegarde
        optionBien = questionnaire.getQuestions().get(0).getOptions().get(0);
        optionMal = questionnaire.getQuestions().get(0).getOptions().get(1);

        // ─── Crée un utilisateur connecté ─────────────────────────
        utilisateurRepository.save(Utilisateur.builder()
                .nom("User").prenom("Test")
                .email("user@test.com")
                .motDePasse(passwordEncoder.encode("password123"))
                .role(Utilisateur.Role.USER)
                .build());

        tokenUser = getToken("user@test.com", "password123");
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

    // ─── GET /api/questionnaires/{id} ─────────────────────────────

    @Test
    @DisplayName("GET /api/questionnaires/{id} - 200 sans token (public)")
    void getQuestionnaire_shouldReturn200WithoutToken() throws Exception {
        mockMvc.perform(get("/api/questionnaires/" + questionnaire.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titre").value("Test Stress"))
                .andExpect(jsonPath("$.questions", hasSize(1)))
                .andExpect(jsonPath("$.questions[0].options", hasSize(2)));
    }

    @Test
    @DisplayName("GET /api/questionnaires/{id} - 400 si questionnaire inexistant")
    void getQuestionnaire_shouldReturn400IfNotFound() throws Exception {
        mockMvc.perform(get("/api/questionnaires/9999"))
                .andExpect(status().isBadRequest());
    }

    // ─── POST /api/diagnostics ────────────────────────────────────

    @Test
    @DisplayName("POST /api/diagnostics - 200 sans token (visiteur anonyme)")
    void submitDiagnostic_shouldReturn200WithoutToken() throws Exception {
        Map<String, Object> body = Map.of(
                "questionnaireId", questionnaire.getId(),
                "optionIds", List.of(optionBien.getId())
        );

        mockMvc.perform(post("/api/diagnostics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scoreTotal").value(0))
                .andExpect(jsonPath("$.niveauStress").value("Stress faible"))
                .andExpect(jsonPath("$.messageResultat").value("Tout va bien."));
    }

    @Test
    @DisplayName("POST /api/diagnostics - 200 avec token (utilisateur connecté)")
    void submitDiagnostic_shouldReturn200WithToken() throws Exception {
        Map<String, Object> body = Map.of(
                "questionnaireId", questionnaire.getId(),
                "optionIds", List.of(optionMal.getId())
        );

        mockMvc.perform(post("/api/diagnostics")
                        .header("Authorization", "Bearer " + tokenUser)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scoreTotal").value(10))
                .andExpect(jsonPath("$.niveauStress").value("Stress élevé"));
    }

    @Test
    @DisplayName("POST /api/diagnostics - 400 si questionnaire inexistant")
    void submitDiagnostic_shouldReturn400IfQuestionnaireNotFound() throws Exception {
        Map<String, Object> body = Map.of(
                "questionnaireId", 9999L,
                "optionIds", List.of(1L)
        );

        mockMvc.perform(post("/api/diagnostics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("introuvable")));
    }

    @Test
    @DisplayName("POST /api/diagnostics - 400 si body invalide")
    void submitDiagnostic_shouldReturn400IfInvalidBody() throws Exception {
        Map<String, Object> body = Map.of(
                "optionIds", List.of()
        );

        mockMvc.perform(post("/api/diagnostics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    // ─── GET /api/diagnostics/me ──────────────────────────────────

    @Test
    @DisplayName("GET /api/diagnostics/me - 200 avec token et retourne l'historique")
    void getMyDiagnostics_shouldReturn200WithHistory() throws Exception {
        // Soumet d'abord un diagnostic
        Map<String, Object> body = Map.of(
                "questionnaireId", questionnaire.getId(),
                "optionIds", List.of(optionBien.getId())
        );

        mockMvc.perform(post("/api/diagnostics")
                .header("Authorization", "Bearer " + tokenUser)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));

        // Vérifie l'historique
        mockMvc.perform(get("/api/diagnostics/me")
                        .header("Authorization", "Bearer " + tokenUser))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].scoreTotal").value(0));
    }

    @Test
    @DisplayName("GET /api/diagnostics/me - 403 sans token")
    void getMyDiagnostics_shouldReturn403WithoutToken() throws Exception {
        mockMvc.perform(get("/api/diagnostics/me"))
                .andExpect(status().isForbidden());
    }
}

