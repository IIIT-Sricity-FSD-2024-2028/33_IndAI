import { StocksService } from './stocks.service';
export declare class StocksController {
    private readonly service;
    constructor(service: StocksService);
    findAll(q?: string, sector?: string, cap?: string): {
        success: boolean;
        count: number;
        data: import("../../store/data.store").Stock[];
    };
    tick(symbols?: string): {
        success: boolean;
        data: {
            replaySpeedMs: number;
            serverTime: string;
            stocks: import("../../store/data.store").Stock[];
            movers: {
                gainers: import("../../store/data.store").Stock[];
                losers: import("../../store/data.store").Stock[];
                active: import("../../store/data.store").Stock[];
            };
        };
    };
    findOne(symbol: string): {
        success: boolean;
        data: import("../../store/data.store").Stock;
    };
    candles(symbol: string, limit?: string): {
        success: boolean;
        count: number;
        data: import("../../store/data.store").Candle[];
    };
}
export declare class MarketAliasController {
    private readonly service;
    constructor(service: StocksService);
    instruments(q?: string, sector?: string, cap?: string): {
        success: boolean;
        count: number;
        data: import("../../store/data.store").Stock[];
    };
    instrument(symbol: string): {
        success: boolean;
        data: import("../../store/data.store").Stock;
    };
    prices(symbols?: string): {
        success: boolean;
        data: {
            replaySpeedMs: number;
            serverTime: string;
            stocks: import("../../store/data.store").Stock[];
            movers: {
                gainers: import("../../store/data.store").Stock[];
                losers: import("../../store/data.store").Stock[];
                active: import("../../store/data.store").Stock[];
            };
        };
    };
    patchPrice(symbol: string): {
        success: boolean;
        data: import("../../store/data.store").Stock;
    };
}
