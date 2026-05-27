import api from './axiosInstance';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

export const authService = {
    login: (data: LoginRequest) =>
        api.post<AuthResponse>('/api/auth/login', data).then(r => r.data),

    register: (data: RegisterRequest) =>
        api.post<AuthResponse>('/api/auth/register', data).then(r => r.data),

    logout: () =>
        api.post('/api/auth/logout'),
};

