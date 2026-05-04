import { DataStore } from '../../store/data.store';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto';
export declare class AssignmentsService {
    private readonly db;
    constructor(db: DataStore);
    findAll(): any[];
    findOne(id: string): any;
    findByLearner(learnerId: string): any[];
    create(body: CreateAssignmentDto): {
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
    update(id: string, body: UpdateAssignmentDto): any;
    submit(id: string, learnerId: string, body?: any): any;
    approve(id: string, learnerId: string): any;
    remove(id: string): {
        id: string;
    };
}
