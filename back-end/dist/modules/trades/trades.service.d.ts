import { DataStore } from '../../store/data.store';
import { CreateTradeDto } from './dto';
export declare class TradesService {
    private readonly db;
    constructor(db: DataStore);
    findAll(): import("../../store/data.store").Trade[];
    findByUser(userId: string): import("../../store/data.store").Trade[];
    execute(dto: CreateTradeDto): {
        trade: {
            id: string;
            learnerId: string;
            symbol: string;
            type: "BUY" | "SELL";
            qty: number;
            price: number;
            total: number;
            date: string;
            status: string;
        };
        portfolio: {
            user: any;
            holdings: Record<string, {
                qty: number;
                spent: number;
            }>;
            marketValue: number;
            trades: import("../../store/data.store").Trade[];
        };
    };
}
