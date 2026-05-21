package com.cesizen.cesizenapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

// ce que l'API renvoie pour afficher/modifier un profil
// On choisis ce qu'on va renvoyer dans le profil utilisateur
// Le UserDTO agit donc comme un filtre
@Data
public class UserDTO {

    private Long id;
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    private String role;
    private boolean estActif;

    @Size(min = 8, message = "Le mot de passe doit faire au moins 8 caractères")
    private String motDePasse; // optionnel, uniquement pour la mise à jour
}