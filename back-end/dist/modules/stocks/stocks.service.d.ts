import { DataStore } from '../../store/data.store';
export declare class StocksService {
    private db;
    private logger;
    constructor(db: DataStore);
    findAll(q?: string, sector?: string, cap?: string): import("../../store/data.store").Stock[];
    findOne(symbol: string): import("../../store/data.store").Stock;
    candles(symbol: string, limit?: number): import("../../store/data.store").Candle[];
    tick(symbols?: string): {
        replaySpeedMs: number;
        serverTime: string;
        stocks: import("../../store/data.store").Stock[];
        movers: {
            gainers: import("../../store/data.store").Stock[];
            losers: import("../../store/data.store").Stock[];
            active: import("../../store/data.store").Stock[];
        };
    };
}
