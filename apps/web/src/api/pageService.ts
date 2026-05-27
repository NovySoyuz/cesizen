import api from './axiosInstance';
import type { PageDto } from '../types/page';

export const pageService = {
    getAllPages: () =>
        api.get<PageDto[]>('/api/pages').then(r => r.data),

    getAllPagesAdmin: () =>
        api.get<PageDto[]>('/api/pages/all').then(r => r.data),

    getPageBySlug: (slug: string) =>
        api.get<PageDto>(`/api/pages/${slug}`).then(r => r.data),

    createPage: (data: Partial<PageDto>) =>
        api.post<PageDto>('/api/pages', data).then(r => r.data),

    updatePage: (id: number, data: Partial<PageDto>) =>
        api.put<PageDto>(`/api/pages/${id}`, data).then(r => r.data),
};

