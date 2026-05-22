package com.cesizen.cesizenapi.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "option_reponse")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionReponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String libelle;

    @Column(nullable = false)
    private Integer points;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_question", nullable = false)
    private Question question;
}