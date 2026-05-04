import { DataStore } from '../../store/data.store';
import { CreateSessionDto, UpdateSessionDto } from './dto';
export declare class SessionsService {
    private readonly db;
    constructor(db: DataStore);
    findAll(): any[];
    findOne(id: string): any;
    findByLearner(learnerId: string): any[];
    create(body: CreateSessionDto): {
        title: string;
        createdAt: string;
        instructorId: string;
        description?: string;
        date: string;
        time: string;
        studentIds?: string[];
        duration?: number;
        status: string;
        type?: string;
        id: string;
    };
    update(id: string, body: UpdateSessionDto): any;
    remove(id: string): {
        id: string;
    };
}
