import api from './axiosInstance';
import type { UserDto } from '../types/auth';

export const userService = {
    getMe: () =>
        api.get<UserDto>('/api/users/me').then(r => r.data),

    updateMe: (data: Partial<UserDto> & { motDePasse?: string }) =>
        api.put<UserDto>('/api/users/me', data).then(r => r.data),

    // Admin
    getAllUsers: () =>
        api.get<UserDto[]>('/api/users').then(r => r.data),

    disableUser: (id: number) =>
        api.delete(`/api/users/${id}/disable`),

    activateUser: (id: number) =>
        api.put<UserDto>(`/api/users/${id}/activate`).then(r => r.data),

    hardDeleteUser: (id: number) =>
        api.delete(`/api/users/${id}`),
};

