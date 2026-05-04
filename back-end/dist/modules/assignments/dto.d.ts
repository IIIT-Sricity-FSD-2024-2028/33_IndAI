export declare class CreateAssignmentDto {
    title: string;
    description: string;
    instructorId: string;
    studentIds?: string[];
    dueDate: string;
    skillPoints: number;
    difficulty?: string;
    status?: string;
    type?: string;
}
export declare class UpdateAssignmentDto {
    title?: string;
    description?: string;
    instructorId?: string;
    studentIds?: string[];
    dueDate?: string;
    skillPoints?: number;
    difficulty?: string;
    status?: string;
    type?: string;
}
export declare class SubmitAssignmentDto {
    learnerId: string;
    submissionText?: string;
}
