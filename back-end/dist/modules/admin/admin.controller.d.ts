import { DataStore } from '../../store/data.store';
import { AssignInstructorDto, UpdateConfigDto } from './dto';
export declare class AdminController {
    private readonly db;
    constructor(db: DataStore);
    config(): {
        success: boolean;
        data: any;
    };
    updateConfig(body: UpdateConfigDto): {
        success: boolean;
        data: any;
    };
    assign(body: AssignInstructorDto): {
        success: boolean;
        data: {
            learner: any;
            instructor: any;
        };
    };
}
