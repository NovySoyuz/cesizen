package com.cesizen.cesizenapi.controller;

import com.cesizen.cesizenapi.dto.AuthResponseDTO;
import com.cesizen.cesizenapi.dto.LoginRequestDTO;
import com.cesizen.cesizenapi.dto.RegisterRequestDTO;
import com.cesizen.cesizenapi.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    // Porte d'entrée de l'appli
    private final AuthService authService;

    // ─── POST /api/auth/register ──────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        AuthResponseDTO response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─── POST /api/auth/login ─────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        AuthResponseDTO response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // ─── POST /api/auth/logout ────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // JWT stateless : la déconnexion réelle se fait côté front
        // en supprimant le token du localStorage
        return ResponseEntity.ok().build();
    }
}