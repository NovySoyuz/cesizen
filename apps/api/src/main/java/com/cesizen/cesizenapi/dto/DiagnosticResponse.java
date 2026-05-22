package com.cesizen.cesizenapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class DiagnosticResponse {
    private Long id;
    private Integer scoreTotal;
    private String niveauStress;
    private String messageResultat;
    private LocalDateTime dateRealisation;
}