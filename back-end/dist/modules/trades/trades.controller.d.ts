import { TradesService } from './trades.service';
import { CreateOrderDto, CreateTradeDto } from './dto';
export declare class TradesController {
    private readonly service;
    constructor(service: TradesService);
    all(): {
        success: boolean;
        data: import("../../store/data.store").Trade[];
    };
    byUser(userId: string): {
        success: boolean;
        data: import("../../store/data.store").Trade[];
    };
    create(dto: CreateTradeDto): {
        success: boolean;
        data: {
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
    };
}
export declare class TradingAliasController {
    private readonly service;
    constructor(service: TradesService);
    allOrders(): {
        success: boolean;
        data: import("../../store/data.store").Trade[];
    };
    learnerOrders(id: string): {
        success: boolean;
        data: import("../../store/data.store").Trade[];
    };
    allTrades(): {
        success: boolean;
        data: import("../../store/data.store").Trade[];
    };
    learnerTrades(id: string): {
        success: boolean;
        data: import("../../store/data.store").Trade[];
    };
    order(dto: CreateOrderDto): {
        success: boolean;
        data: {
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
    };
}
