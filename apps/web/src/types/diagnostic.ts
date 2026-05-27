export interface OptionReponseDto {
    id: number;
    libelle: string;
    points: number;
}

export interface QuestionDto {
    id: number;
    libelle: string;
    ordre: number;
    options: OptionReponseDto[];
}

export interface QuestionnaireDto {
    id: number;
    titre: string;
    description: string;
    questions: QuestionDto[];
}

export interface DiagnosticRequest {
    questionnaireId: number;
    optionIds: number[];
}

export interface DiagnosticResponse {
    id: number;
    scoreTotal: number;
    niveauStress: string;
    messageResultat: string;
    dateRealisation: string;
}

