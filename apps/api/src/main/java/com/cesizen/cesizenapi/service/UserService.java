package com.cesizen.cesizenapi.service;

import com.cesizen.cesizenapi.dto.UserDTO;
import com.cesizen.cesizenapi.model.Utilisateur;
import com.cesizen.cesizenapi.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Logique metier pour modification d'un profil utilisateur
public class UserService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    // ─── Récupère le profil de l'utilisateur connecté ────────────
    public UserDTO getMe(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        return toDto(utilisateur);
    }

    // ─── Met à jour le profil de l'utilisateur connecté ──────────
    public UserDTO updateMe(String email, UserDTO dto) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        utilisateur.setNom(dto.getNom());
        utilisateur.setPrenom(dto.getPrenom());

        // Mise à jour du mot de passe uniquement s'il est fourni
        if (dto.getMotDePasse() != null && !dto.getMotDePasse().isBlank()) {
            utilisateur.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
        }
        // Modification email si fourni et différent
        if (dto.getEmail() != null && !dto.getEmail().equals(utilisateur.getEmail())) {
            if (utilisateurRepository.existsByEmail(dto.getEmail())) {
                throw new RuntimeException("Cet email est déjà utilisé");
            }
            utilisateur.setEmail(dto.getEmail());
        }

        utilisateurRepository.save(utilisateur);
        return toDto(utilisateur);
    }

    // ─── Liste tous les utilisateurs (admin) ─────────────────────
    public List<UserDTO> getAllUsers() {
        return utilisateurRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ─── Désactive un compte (admin uniquement) ───────────────────
    public void deleteUser(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        utilisateur.setEstActif(false);
        utilisateurRepository.save(utilisateur);
    }

    // ─── Supprime définitivement un compte (admin uniquement) ─────
    public void hardDeleteUser(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        utilisateurRepository.delete(utilisateur);
    }

    // ─── Réactive un compte désactivé (admin uniquement) ─────────
    public UserDTO activateUser(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        utilisateur.setEstActif(true);
        utilisateurRepository.save(utilisateur);
        return toDto(utilisateur);
    }

    // ─── Convertit une entité en DTO (sans mot de passe) ─────────
    private UserDTO toDto(Utilisateur utilisateur) {
        UserDTO dto = new UserDTO();
        dto.setId(utilisateur.getId());
        dto.setNom(utilisateur.getNom());
        dto.setPrenom(utilisateur.getPrenom());
        dto.setEmail(utilisateur.getEmail());
        dto.setRole(utilisateur.getRole().name());
        dto.setEstActif(utilisateur.isEstActif());
        return dto;
    }
}