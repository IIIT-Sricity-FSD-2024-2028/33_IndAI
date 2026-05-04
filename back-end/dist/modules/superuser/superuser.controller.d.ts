import { DataStore } from '../../store/data.store';
export declare class SuperuserController {
    private readonly db;
    constructor(db: DataStore);
    overview(): {
        success: boolean;
        data: {
            users: number;
            courses: number;
            trades: number;
            notifications: number;
        };
    };
    allData(): {
        success: boolean;
        data: {
            users: any[];
            stocks: import("../../store/data.store").Stock[];
            candles: Record<string, import("../../store/data.store").Candle[]>;
            trades: import("../../store/data.store").Trade[];
            watchlists: any[];
            courses: any[];
            assignments: any[];
            sessions: any[];
            notifications: any[];
            enrollments: any[];
            courseModules: any[];
            quizzes: any[];
            feedback: any[];
            diagnostics: any[];
            config: any;
        };
    };
    reset(): {
        success: boolean;
        message: string;
    };
}
