export declare class CreateSessionDto {
    instructorId: string;
    title: string;
    description?: string;
    date: string;
    time: string;
    studentIds?: string[];
    duration?: number;
    status?: string;
    type?: string;
}
export declare class UpdateSessionDto {
    instructorId?: string;
    title?: string;
    description?: string;
    date?: string;
    time?: string;
    studentIds?: string[];
    duration?: number;
    status?: string;
    type?: string;
}
