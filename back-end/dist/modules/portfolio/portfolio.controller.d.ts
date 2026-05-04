import { UsersService } from '../users/users.service';
export declare class PortfolioController {
    private readonly users;
    constructor(users: UsersService);
    one(id: string): {
        success: boolean;
        data: {
            user: any;
            holdings: Record<string, {
                qty: number;
                spent: number;
            }>;
            marketValue: number;
            trades: import("../../store/data.store").Trade[];
        };
    };
    holdings(id: string): {
        success: boolean;
        data: Record<string, {
            qty: number;
            spent: number;
        }>;
    };
    performance(id: string): {
        success: boolean;
        data: {
            portfolioValue: any;
            virtualBalance: any;
            totalTrades: number;
            profitableTrades: number;
            marketValue: number;
        };
    };
}
