package com.cesizen.cesizenapi.service;

import com.cesizen.cesizenapi.dto.DiagnosticRequest;
import com.cesizen.cesizenapi.dto.DiagnosticResponse;
import com.cesizen.cesizenapi.dto.OptionReponseDTO;
import com.cesizen.cesizenapi.dto.QuestionDTO;
import com.cesizen.cesizenapi.dto.QuestionnaireDTO;
import com.cesizen.cesizenapi.model.*;
import com.cesizen.cesizenapi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiagnosticService {

    private final DiagnosticRepository diagnosticRepository;
    private final QuestionnaireRepository questionnaireRepository;
    private final OptionReponseRepository optionReponseRepository;
    private final UtilisateurRepository utilisateurRepository;

    // ─── Récupère un questionnaire avec ses questions/options ─────
    @Transactional(readOnly = true)
    public QuestionnaireDTO getQuestionnaire(Long id) {
        Questionnaire q = questionnaireRepository.findById(id)
                .filter(Questionnaire::isEstActif)
                .orElseThrow(() -> new RuntimeException("Questionnaire introuvable"));

        QuestionnaireDTO dto = new QuestionnaireDTO();
        dto.setId(q.getId());
        dto.setTitre(q.getTitre());
        dto.setDescription(q.getDescription());
        dto.setQuestions(q.getQuestions().stream().map(question -> {
            QuestionDTO qDto = new QuestionDTO();
            qDto.setId(question.getId());
            qDto.setLibelle(question.getLibelle());
            qDto.setOrdre(question.getOrdre());
            qDto.setOptions(question.getOptions().stream().map(option -> {
                OptionReponseDTO oDto = new OptionReponseDTO();
                oDto.setId(option.getId());
                oDto.setLibelle(option.getLibelle());
                oDto.setPoints(option.getPoints());
                return oDto;
            }).toList());
            return qDto;
        }).toList());

        return dto;
    }

    // ─── Soumet un diagnostic et calcule le score ─────────────────
    @Transactional
    public DiagnosticResponse submitDiagnostic(DiagnosticRequest request, String email) {

        Questionnaire questionnaire = questionnaireRepository.findById(request.getQuestionnaireId())
                .orElseThrow(() -> new RuntimeException("Questionnaire introuvable"));

        // Récupère les options choisies
        List<OptionReponse> options = request.getOptionIds().stream()
                .map(id -> optionReponseRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Option introuvable : " + id)))
                .toList();

        // Calcule le score total
        int scoreTotal = options.stream().mapToInt(OptionReponse::getPoints).sum();

        // Trouve l'interprétation correspondante
        Interpretation interpretation = questionnaire.getInterpretations().stream()
                .filter(i -> scoreTotal >= i.getScoreMin() && scoreTotal <= i.getScoreMax())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Aucune interprétation pour ce score"));

        // Crée le diagnostic
        Diagnostic diagnostic = Diagnostic.builder()
                .questionnaire(questionnaire)
                .scoreTotal(scoreTotal)
                .utilisateur(email != null ? utilisateurRepository.findByEmail(email).orElse(null) : null)
                .build();

        diagnostic = diagnosticRepository.save(diagnostic);

        // Sauvegarde les choix
        Diagnostic finalDiagnostic = diagnostic;
        List<ChoixUtilisateur> choix = new ArrayList<>(options.stream()
                .map(option -> ChoixUtilisateur.builder()
                        .diagnostic(finalDiagnostic)
                        .option(option)
                        .build())
                .toList());
        finalDiagnostic.setChoix(choix);
        diagnosticRepository.save(finalDiagnostic);

        return new DiagnosticResponse(
                diagnostic.getId(),
                scoreTotal,
                interpretation.getNiveauStress(),
                interpretation.getMessageResultat(),
                diagnostic.getDateRealisation()
        );
    }

    // ─── Historique des diagnostics d'un utilisateur ──────────────
    @Transactional(readOnly = true)
    public List<DiagnosticResponse> getMyDiagnostics(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        return diagnosticRepository.findAllByUtilisateurId(utilisateur.getId()).stream()
                .map(d -> new DiagnosticResponse(
                        d.getId(),
                        d.getScoreTotal(),
                        d.getQuestionnaire().getTitre(),
                        null,
                        d.getDateRealisation()
                ))
                .toList();
    }
}