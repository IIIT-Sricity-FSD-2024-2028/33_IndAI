export declare class CreateQuizDto {
    courseId?: string;
    providerId?: string;
    title: string;
    questions?: any;
    questionCount?: number;
    status?: string;
}
export declare class UpdateQuizDto {
    title?: string;
    courseId?: string;
    questions?: any;
    questionCount?: number;
    timeLimit?: number;
    passingScore?: number;
    skillPointsOnPass?: number;
    instructions?: string;
    status?: string;
}
export declare class SubmitQuizDto {
    learnerId: string;
    answers: number[];
}
