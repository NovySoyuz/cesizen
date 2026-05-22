package com.cesizen.cesizenapi.dto;

import lombok.Data;

import java.util.List;

@Data
public class QuestionnaireDTO {
    private Long id;
    private String titre;
    private String description;
    private List<QuestionDTO> questions;
}