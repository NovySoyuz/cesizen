package com.cesizen.cesizenapi.controller;

import com.cesizen.cesizenapi.dto.*;
import com.cesizen.cesizenapi.service.ModeratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/moderateur")
@RequiredArgsConstructor
public class ModeratorController {

    private final ModeratorService moderatorService;

    // ─── GET questionnaire complet (modérateur & admin) ──────────────
    @GetMapping("/questionnaires/{id}")
    public ResponseEntity<QuestionnaireDTO> getQuestionnaire(@PathVariable Long id) {
        return ResponseEntity.ok(moderatorService.getQuestionnaireAdmin(id));
    }

    // ─── POST nouvelle question ───────────────────────────────────────
    @PostMapping("/questionnaires/{questionnaireId}/questions")
    public ResponseEntity<QuestionDTO> createQuestion(
            @PathVariable Long questionnaireId,
            @RequestBody QuestionRequestDTO request) {
        return ResponseEntity.ok(moderatorService.createQuestion(questionnaireId, request));
    }

    // ─── PUT mise à jour question ─────────────────────────────────────
    @PutMapping("/questions/{questionId}")
    public ResponseEntity<QuestionDTO> updateQuestion(
            @PathVariable Long questionId,
            @RequestBody QuestionRequestDTO request) {
        return ResponseEntity.ok(moderatorService.updateQuestion(questionId, request));
    }

    // ─── PUT mise à jour option (points) ─────────────────────────────
    @PutMapping("/options/{optionId}")
    public ResponseEntity<OptionReponseDTO> updateOption(
            @PathVariable Long optionId,
            @RequestBody OptionReponseRequestDTO request) {
        return ResponseEntity.ok(moderatorService.updateOption(optionId, request));
    }

    // ─── DELETE question ──────────────────────────────────────────────
    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        moderatorService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }
}

