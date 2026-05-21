package com.cesizen.cesizenapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
// ce que l'API renvoie après register/login
@Data
@AllArgsConstructor
public class AuthResponseDTO {

    private String token;
    private String type = "Bearer";
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String role;

    public AuthResponseDTO(String token, Long id, String nom, String prenom, String email, String role) {
        this.token = token;
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.role = role;
    }
}