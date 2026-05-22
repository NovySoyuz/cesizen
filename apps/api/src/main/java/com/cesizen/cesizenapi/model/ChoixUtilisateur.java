package com.cesizen.cesizenapi.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "choix_utilisateur")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChoixUtilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_diagnostic", nullable = false)
    private Diagnostic diagnostic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_option", nullable = false)
    private OptionReponse option;
}