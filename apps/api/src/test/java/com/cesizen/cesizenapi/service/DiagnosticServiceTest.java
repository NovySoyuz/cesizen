package com.cesizen.cesizenapi.service;

import com.cesizen.cesizenapi.dto.DiagnosticRequest;
import com.cesizen.cesizenapi.dto.DiagnosticResponse;
import com.cesizen.cesizenapi.model.*;
import com.cesizen.cesizenapi.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiagnosticServiceTest {

    @Mock private DiagnosticRepository diagnosticRepository;
    @Mock private QuestionnaireRepository questionnaireRepository;
    @Mock private OptionReponseRepository optionReponseRepository;
    @Mock private UtilisateurRepository utilisateurRepository;

    @InjectMocks private DiagnosticService diagnosticService;

    private Questionnaire questionnaire;
    private OptionReponse option1, option2;
    private Interpretation interpretation;

    @BeforeEach
    void setUp() {
        option1 = OptionReponse.builder().id(1L).libelle("Jamais").points(0).build();
        option2 = OptionReponse.builder().id(2L).libelle("Souvent").points(10).build();

        interpretation = Interpretation.builder()
                .id(1L).scoreMin(0).scoreMax(20)
                .niveauStress("Stress faible")
                .messageResultat("Vous gérez bien votre stress.")
                .build();

        questionnaire = Questionnaire.builder()
                .id(1L).titre("Test Stress").estActif(true)
                .questions(List.of())
                .interpretations(List.of(interpretation))
                .build();
    }

    @Test
    @DisplayName("submitDiagnostic - doit calculer le score correctement")
    void submitDiagnostic_shouldCalculateScoreCorrectly() {
        DiagnosticRequest request = new DiagnosticRequest();
        request.setQuestionnaireId(1L);
        request.setOptionIds(List.of(1L, 2L));

        when(questionnaireRepository.findById(1L)).thenReturn(Optional.of(questionnaire));
        when(optionReponseRepository.findById(1L)).thenReturn(Optional.of(option1));
        when(optionReponseRepository.findById(2L)).thenReturn(Optional.of(option2));
        when(diagnosticRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DiagnosticResponse response = diagnosticService.submitDiagnostic(request, null);

        assertThat(response.getScoreTotal()).isEqualTo(10); // 0 + 10
        assertThat(response.getNiveauStress()).isEqualTo("Stress faible");
        assertThat(response.getMessageResultat()).isEqualTo("Vous gérez bien votre stress.");
    }

    @Test
    @DisplayName("submitDiagnostic - doit lever une exception si questionnaire introuvable")
    void submitDiagnostic_shouldThrowIfQuestionnaireNotFound() {
        DiagnosticRequest request = new DiagnosticRequest();
        request.setQuestionnaireId(99L);
        request.setOptionIds(List.of(1L));

        when(questionnaireRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> diagnosticService.submitDiagnostic(request, null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("introuvable");
    }

    @Test
    @DisplayName("submitDiagnostic - doit lever une exception si aucune interprétation trouvée")
    void submitDiagnostic_shouldThrowIfNoInterpretationFound() {
        DiagnosticRequest request = new DiagnosticRequest();
        request.setQuestionnaireId(1L);
        request.setOptionIds(List.of(2L));

        // Score 10 mais interprétation pour 50-100
        interpretation.setScoreMin(50);
        interpretation.setScoreMax(100);

        when(questionnaireRepository.findById(1L)).thenReturn(Optional.of(questionnaire));
        when(optionReponseRepository.findById(2L)).thenReturn(Optional.of(option2));

        assertThatThrownBy(() -> diagnosticService.submitDiagnostic(request, null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("interprétation");
    }

    @Test
    @DisplayName("getMyDiagnostics - doit retourner l'historique de l'utilisateur")
    void getMyDiagnostics_shouldReturnUserHistory() {
        Utilisateur utilisateur = Utilisateur.builder().id(1L).email("eric@test.com").build();
        Diagnostic diagnostic = Diagnostic.builder()
                .id(1L).scoreTotal(10)
                .questionnaire(questionnaire)
                .utilisateur(utilisateur)
                .build();

        when(utilisateurRepository.findByEmail("eric@test.com")).thenReturn(Optional.of(utilisateur));
        when(diagnosticRepository.findAllByUtilisateurId(1L)).thenReturn(List.of(diagnostic));

        List<DiagnosticResponse> result = diagnosticService.getMyDiagnostics("eric@test.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getScoreTotal()).isEqualTo(10);
    }
}