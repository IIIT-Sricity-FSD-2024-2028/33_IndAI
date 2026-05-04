export declare class CreateNotificationDto {
    userId: string;
    title?: string;
    message: string;
    type?: string;
    read?: boolean;
    id?: string;
    createdAt?: string;
}
export declare class UpdateNotificationDto {
    title?: string;
    message?: string;
    type?: string;
    read?: boolean;
}
