// Définit la forme des données qui transitent avec l'API

export interface RegisterRequest {
    nom: string;
    prenom: string;
    email: string;
    motDePasse: string;
}

export interface LoginRequest {
    email: string;
    motDePasse: string;
}

export interface AuthResponse {
    token: string;
    type: string;
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: string;
}

export interface UserDto {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    estActif: boolean;
}