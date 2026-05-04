import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, SubmitAssignmentDto, UpdateAssignmentDto } from './dto';
export declare class AssignmentsController {
    private readonly service;
    constructor(service: AssignmentsService);
    all(): {
        success: boolean;
        data: any[];
    };
    byLearner(learnerId: string): {
        success: boolean;
        data: any[];
    };
    one(id: string): {
        success: boolean;
        data: any;
    };
    create(b: CreateAssignmentDto): {
        success: boolean;
        data: {
            title: string;
            description: string;
            createdAt: string;
            instructorId: string;
            studentIds?: string[];
            dueDate: string;
            skillPoints: number;
            difficulty?: string;
            status: string;
            type?: string;
            id: string;
            completedIds: any[];
        };
    };
    update(id: string, b: UpdateAssignmentDto): {
        success: boolean;
        data: any;
    };
    submit(id: string, b: SubmitAssignmentDto): {
        success: boolean;
        data: any;
    };
    approve(id: string, learnerId: string): {
        success: boolean;
        data: any;
    };
    remove(id: string): {
        success: boolean;
        data: {
            id: string;
        };
    };
}
