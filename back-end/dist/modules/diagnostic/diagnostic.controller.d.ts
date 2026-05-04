import { DataStore } from '../../store/data.store';
import { SubmitDiagnosticDto } from './dto';
export declare class DiagnosticController {
    private readonly db;
    constructor(db: DataStore);
    submit(b: SubmitDiagnosticDto): {
        success: boolean;
        data: {
            id: string;
            learnerId: string;
            score: number;
            level: string;
            submittedAt: string;
        };
    };
    get(learnerId: string): {
        success: boolean;
        data: any[];
    };
}
