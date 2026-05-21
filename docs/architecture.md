com.cesizen.cesizenapi
├── config/
│   └── SecurityConfig.java        # Étape 4
├── controller/
│   ├── AuthController.java        # Étape 5
│   └── UserController.java        # Étape 6
├── dto/
│   ├── RegisterRequest.java       # Étape 3
│   ├── LoginRequest.java          # Étape 3
│   ├── AuthResponse.java          # Étape 3
│   └── UserDto.java               # Étape 3
├── exception/
│   └── GlobalExceptionHandler.java # Étape 7
├── model/
│   └── Utilisateur.java           # Étape 1 ← on commence ici
├── repository/
│   └── UtilisateurRepository.java # Étape 2
└── security/
├── JwtUtil.java               # Étape 4
├── JwtFilter.java             # Étape 4
└── UserDetailsServiceImpl.java # Étape 4