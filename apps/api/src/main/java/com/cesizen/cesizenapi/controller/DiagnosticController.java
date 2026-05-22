package com.cesizen.cesizenapi.controller;

import com.cesizen.cesizenapi.dto.DiagnosticRequest;
import com.cesizen.cesizenapi.dto.DiagnosticResponse;
import com.cesizen.cesizenapi.service.DiagnosticService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diagnostics")
@RequiredArgsConstructor
public class DiagnosticController {

    private final DiagnosticService diagnosticService;

    // ─── POST /api/diagnostics (public + connecté) ────────────────
    @PostMapping
    public ResponseEntity<DiagnosticResponse> submit(
            @Valid @RequestBody DiagnosticRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(diagnosticService.submitDiagnostic(request, email));
    }

    // ─── GET /api/diagnostics/me (connecté uniquement) ────────────
    @GetMapping("/me")
    public ResponseEntity<List<DiagnosticResponse>> getMyDiagnostics(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(diagnosticService.getMyDiagnostics(userDetails.getUsername()));
    }
}