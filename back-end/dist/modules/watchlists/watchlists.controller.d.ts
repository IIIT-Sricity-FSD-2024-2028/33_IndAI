import { WatchlistsService } from './watchlists.service';
import { AddWatchlistSymbolDto, CreateWatchlistDto, UpdateWatchlistDto } from './dto';
export declare class WatchlistsController {
    private readonly service;
    constructor(service: WatchlistsService);
    list(userId: string): {
        success: boolean;
        data: any[];
    };
    create(userId: string, b: CreateWatchlistDto): {
        success: boolean;
        data: {
            id: string;
            userId: string;
            name: any;
            active: boolean;
            symbols: unknown[];
        };
    };
    addItem(userId: string, b: AddWatchlistSymbolDto): {
        success: boolean;
        data: any;
    };
    removeItem(userId: string, symbol: string): {
        success: boolean;
        data: any;
    };
    update(id: string, b: UpdateWatchlistDto): {
        success: boolean;
        data: any;
    };
    add(id: string, symbol: string): {
        success: boolean;
        data: any;
    };
    remSym(id: string, symbol: string): {
        success: boolean;
        data: any;
    };
    remove(id: string): {
        success: boolean;
        data: {
            id: string;
        };
    };
}
