package com.cesizen.cesizenapi.service;

import com.cesizen.cesizenapi.dto.AuthResponseDTO;
import com.cesizen.cesizenapi.dto.LoginRequestDTO;
import com.cesizen.cesizenapi.dto.RegisterRequestDTO;
import com.cesizen.cesizenapi.model.Utilisateur;
import com.cesizen.cesizenapi.repository.UtilisateurRepository;
import com.cesizen.cesizenapi.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UtilisateurRepository utilisateurRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserDetailsService userDetailsService;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private RegisterRequestDTO registerRequest;
    private LoginRequestDTO loginRequest;
    private Utilisateur utilisateur;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequestDTO();
        registerRequest.setNom("Dupont");
        registerRequest.setPrenom("Eric");
        registerRequest.setEmail("eric@example.com");
        registerRequest.setMotDePasse("motdepasse123");

        loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("eric@example.com");
        loginRequest.setMotDePasse("motdepasse123");

        utilisateur = Utilisateur.builder()
                .nom("Dupont")
                .prenom("Eric")
                .email("eric@example.com")
                .motDePasse("hashedpassword")
                .build();

        userDetails = new User("eric@example.com", "hashedpassword",
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    // ─── register ─────────────────────────────────────────────────

    @Test
    @DisplayName("register - doit créer un utilisateur et retourner un token")
    void register_shouldCreateUserAndReturnToken() {
        when(utilisateurRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedpassword");
        when(utilisateurRepository.save(any())).thenReturn(utilisateur);
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);
        when(jwtUtil.generateToken(any())).thenReturn("fake-jwt-token");

        AuthResponseDTO response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("fake-jwt-token");
        assertThat(response.getEmail()).isEqualTo("eric@example.com");
        verify(utilisateurRepository).save(any(Utilisateur.class));
    }

    @Test
    @DisplayName("register - doit lever une exception si l'email est déjà utilisé")
    void register_shouldThrowIfEmailAlreadyExists() {
        when(utilisateurRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("déjà utilisé");

        verify(utilisateurRepository, never()).save(any());
    }

    @Test
    @DisplayName("register - doit hasher le mot de passe avant de sauvegarder")
    void register_shouldEncodePassword() {
        when(utilisateurRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("motdepasse123")).thenReturn("hashedpassword");
        when(utilisateurRepository.save(any())).thenReturn(utilisateur);
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);
        when(jwtUtil.generateToken(any())).thenReturn("fake-jwt-token");

        authService.register(registerRequest);

        verify(passwordEncoder).encode("motdepasse123");
    }

    // ─── login ────────────────────────────────────────────────────

    @Test
    @DisplayName("login - doit retourner un token si les credentials sont valides")
    void login_shouldReturnTokenForValidCredentials() {
        when(authenticationManager.authenticate(any())).thenReturn(
                new UsernamePasswordAuthenticationToken("eric@example.com", null, List.of())
        );
        when(utilisateurRepository.findByEmail(anyString())).thenReturn(Optional.of(utilisateur));
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);
        when(jwtUtil.generateToken(any())).thenReturn("fake-jwt-token");

        AuthResponseDTO response = authService.login(loginRequest);

        assertThat(response.getToken()).isEqualTo("fake-jwt-token");
        assertThat(response.getEmail()).isEqualTo("eric@example.com");
    }

    @Test
    @DisplayName("login - doit lever BadCredentialsException si les credentials sont invalides")
    void login_shouldThrowForInvalidCredentials() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);

        verify(utilisateurRepository, never()).findByEmail(anyString());
    }
}