export declare class CreateFeedbackDto {
    instructorId: string;
    learnerId: string;
    message: string;
    rating?: number;
}
export declare class UpdateFeedbackDto {
    message?: string;
    rating?: number;
}
