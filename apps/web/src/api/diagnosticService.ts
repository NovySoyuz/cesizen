import api from './axiosInstance';
import type { DiagnosticRequest, DiagnosticResponse, QuestionnaireDto } from '../types/diagnostic';

export const diagnosticService = {
    getQuestionnaire: (id: number) =>
        api.get<QuestionnaireDto>(`/api/questionnaires/${id}`).then(r => r.data),

    submitDiagnostic: (data: DiagnosticRequest) =>
        api.post<DiagnosticResponse>('/api/diagnostics', data).then(r => r.data),

    getMyDiagnostics: () =>
        api.get<DiagnosticResponse[]>('/api/diagnostics/me').then(r => r.data),
};

