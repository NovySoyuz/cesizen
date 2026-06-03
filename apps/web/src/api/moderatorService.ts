import api from './axiosInstance';
import type { QuestionnaireDto, QuestionDto, OptionReponseDto } from '../types/diagnostic';

export interface QuestionRequestDto {
    libelle: string;
    ordre?: number;
    options: { libelle: string; points: number }[];
}

export interface OptionRequestDto {
    libelle?: string;
    points?: number;
}

export const moderatorService = {
    getQuestionnaire: (id: number) =>
        api.get<QuestionnaireDto>(`/api/moderateur/questionnaires/${id}`).then(r => r.data),

    createQuestion: (questionnaireId: number, data: QuestionRequestDto) =>
        api.post<QuestionDto>(`/api/moderateur/questionnaires/${questionnaireId}/questions`, data).then(r => r.data),

    updateQuestion: (questionId: number, data: Partial<QuestionRequestDto>) =>
        api.put<QuestionDto>(`/api/moderateur/questions/${questionId}`, data).then(r => r.data),

    updateOption: (optionId: number, data: OptionRequestDto) =>
        api.put<OptionReponseDto>(`/api/moderateur/options/${optionId}`, data).then(r => r.data),

    deleteQuestion: (questionId: number) =>
        api.delete(`/api/moderateur/questions/${questionId}`).then(r => r.data),
};

