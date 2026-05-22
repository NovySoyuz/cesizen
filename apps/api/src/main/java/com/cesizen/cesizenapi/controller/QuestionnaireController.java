package com.cesizen.cesizenapi.controller;

import com.cesizen.cesizenapi.dto.QuestionnaireDTO;
import com.cesizen.cesizenapi.service.DiagnosticService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questionnaires")
@RequiredArgsConstructor
public class QuestionnaireController {

    private final DiagnosticService diagnosticService;

    // ─── GET /api/questionnaires/{id} (public) ────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<QuestionnaireDTO> getQuestionnaire(@PathVariable Long id) {
        return ResponseEntity.ok(diagnosticService.getQuestionnaire(id));
    }
}