package com.cesizen.cesizenapi.controller;

import com.cesizen.cesizenapi.dto.UserDTO;
import com.cesizen.cesizenapi.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ─── GET /api/users/me ────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getMe(userDetails.getUsername()));
    }

    // ─── PUT /api/users/me ────────────────────────────────────────
    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateMe(@AuthenticationPrincipal UserDetails userDetails,
                                            @Valid @RequestBody UserDTO dto) {
        return ResponseEntity.ok(userService.updateMe(userDetails.getUsername(), dto));
    }

    // ─── GET /api/users (admin) ────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ─── DELETE /api/users/{id}/disable (désactivation) ─────────
    @DeleteMapping("/{id}/disable")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ─── PUT /api/users/{id}/activate (réactivation) ─────────────
    @PutMapping("/{id}/activate")
    public ResponseEntity<UserDTO> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.activateUser(id));
    }

    // ─── DELETE /api/users/{id} (suppression définitive) ─────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> hardDeleteUser(@PathVariable Long id) {
        userService.hardDeleteUser(id);
        return ResponseEntity.noContent().build();
    }
}