package com.cesizen.cesizenapi.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuestionRequestDTO {
    private String libelle;
    private Integer ordre;
    private List<OptionReponseRequestDTO> options;
}

