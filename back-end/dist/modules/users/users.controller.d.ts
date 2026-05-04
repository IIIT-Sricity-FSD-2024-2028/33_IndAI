import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
export declare class UsersController {
    private readonly service;
    constructor(service: UsersService);
    all(): {
        success: boolean;
        data: any[];
    };
    byRole(role: string): {
        success: boolean;
        data: any[];
    };
    one(id: string): {
        success: boolean;
        data: any;
    };
    create(dto: CreateUserDto): {
        success: boolean;
        data: any;
    };
    register(dto: CreateUserDto): {
        success: boolean;
        data: any;
    };
    update(id: string, dto: UpdateUserDto): {
        success: boolean;
        data: any;
    };
    remove(id: string): {
        success: boolean;
        data: {
            id: string;
        };
    };
    portfolio(id: string): {
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
}
