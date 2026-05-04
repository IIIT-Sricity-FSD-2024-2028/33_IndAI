import { OnModuleInit } from '@nestjs/common';
export type Role = 'superuser' | 'admin' | 'instructor' | 'provider' | 'learner';
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: Role;
    status: string;
    skillPoints: number;
    virtualBalance: number;
    portfolioValue: number;
    tradingLimit: number;
    startingBalance: number;
    instructorId?: string;
    studentIds?: string[];
    organization?: string;
    expertise?: string;
    learnerLevel?: string;
}
export interface Stock {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changeAbs: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    cap: string;
    sector: string;
    marketCap: string;
    vol: string;
    dataSource: string;
    lastTickAt?: string;
    replayIndex?: number;
}
export interface Candle {
    datetime: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
export interface Trade {
    id: string;
    learnerId: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    qty: number;
    price: number;
    total: number;
    date: string;
    status: string;
}
export declare class DataStore implements OnModuleInit {
    private logger;
    users: User[];
    stocks: Stock[];
    candles: Record<string, Candle[]>;
    trades: Trade[];
    private marketStartedAt;
    private replaySpeedMs;
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
    private names;
    onModuleInit(): void;
    id(prefix: string): string;
    private seed;
    private loadCsvStocks;
    private parseCsv;
    private fakeMarketCap;
    private fakeVolume;
    private currentIndex;
    private buildStockSnapshot;
    getLiveStock(symbol: string): Stock;
    getLiveStocks(): Stock[];
    getLiveCandles(symbol: string, limit?: number): Candle[];
    getMarketTick(symbols?: string[]): {
        replaySpeedMs: number;
        serverTime: string;
        stocks: Stock[];
        movers: {
            gainers: Stock[];
            losers: Stock[];
            active: Stock[];
        };
    };
    getUser(id: string): User;
    getStock(symbol: string): Stock;
    getHoldings(userId: string): Record<string, {
        qty: number;
        spent: number;
    }>;
    refreshPortfolio(userId: string): {
        user: any;
        holdings: Record<string, {
            qty: number;
            spent: number;
        }>;
        marketValue: number;
        trades: Trade[];
    };
    findUserByEmail(email: string): User;
    safeUser(user: any): any;
    ensureCourseExists(courseId: string): any;
    ensureLearnerExists(learnerId: string): User;
}
