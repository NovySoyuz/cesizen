package com.cesizen.cesizenapi.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PageDTO {

    private Long id;

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    private String slug;
    private String contenu;
    private boolean estActif;
}