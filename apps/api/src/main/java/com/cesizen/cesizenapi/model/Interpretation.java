package com.cesizen.cesizenapi.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interpretation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Interpretation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "score_min", nullable = false)
    private Integer scoreMin;

    @Column(name = "score_max", nullable = false)
    private Integer scoreMax;

    @Column(name = "niveau_stress", nullable = false, length = 50)
    private String niveauStress;

    @Column(name = "message_resultat", columnDefinition = "TEXT")
    private String messageResultat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_questionnaire", nullable = false)
    private Questionnaire questionnaire;
}