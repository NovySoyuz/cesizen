package com.cesizen.cesizenapi.dto;

import lombok.Data;

import java.util.List;

@Data
public class QuestionDTO {
    private Long id;
    private String libelle;
    private Integer ordre;
    private List<OptionReponseDTO> options;
}