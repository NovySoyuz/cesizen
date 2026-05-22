package com.cesizen.cesizenapi.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class DiagnosticRequest {

    @NotNull(message = "L'identifiant du questionnaire est obligatoire")
    private Long questionnaireId;

    @NotEmpty(message = "Les réponses sont obligatoires")
    private List<Long> optionIds; // IDs des options choisies par l'utilisateur
}