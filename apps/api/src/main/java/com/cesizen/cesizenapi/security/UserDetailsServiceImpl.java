package com.cesizen.cesizenapi.security;

import com.cesizen.cesizenapi.model.Utilisateur;
import com.cesizen.cesizenapi.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
// classe pour valider la connexion de l'utilisateur
// Charge l'utilisateur depuis la BDD et le convertit en objet Soring Secutity
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;
    // On cherche le mail dans la BDD
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé : " + email));
        // S'il n'est pas actif
        if (!utilisateur.isEstActif()) {
            throw new UsernameNotFoundException("Compte désactivé : " + email);
        }

        return new User(
                // On envoie le mail + mdp depuis notre BDD à spring security
                // C'est lui qui se charge de vérifier que le mot de passe envoyé par le client correspond à celui de la BDD
                utilisateur.getEmail(),
                utilisateur.getMotDePasse(),
                // Définition du role (de base simple user
                List.of(new SimpleGrantedAuthority("ROLE_" + utilisateur.getRole().name()))
        );
    }
}