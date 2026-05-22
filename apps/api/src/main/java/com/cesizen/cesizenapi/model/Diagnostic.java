package com.cesizen.cesizenapi.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "diagnostic")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Diagnostic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_realisation")
    @Builder.Default
    private LocalDateTime dateRealisation = LocalDateTime.now();

    @Column(name = "score_total")
    private Integer scoreTotal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_questionnaire", nullable = false)
    private Questionnaire questionnaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur; // NULL si visiteur anonyme

    @OneToMany(mappedBy = "diagnostic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChoixUtilisateur> choix;
}