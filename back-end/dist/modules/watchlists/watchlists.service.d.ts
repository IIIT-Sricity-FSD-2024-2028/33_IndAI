import { DataStore } from '../../store/data.store';
export declare class WatchlistsService {
    private readonly db;
    constructor(db: DataStore);
    list(userId: string): any[];
    create(userId: string, b: any): {
        id: string;
        userId: string;
        name: any;
        active: boolean;
        symbols: unknown[];
    };
    update(id: string, b: any): any;
    addSymbol(id: string, symbol: string): any;
    removeSymbol(id: string, symbol: string): any;
    remove(id: string): {
        id: string;
    };
    private assertStock;
}
