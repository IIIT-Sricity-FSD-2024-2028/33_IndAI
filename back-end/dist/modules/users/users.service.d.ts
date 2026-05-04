import { DataStore } from '../../store/data.store';
import { CreateUserDto, UpdateUserDto } from './dto';
export declare class UsersService {
    private readonly db;
    constructor(db: DataStore);
    findAll(): any[];
    findByRole(role: string): any[];
    findOne(id: string): any;
    create(dto: CreateUserDto): any;
    update(id: string, dto: UpdateUserDto): any;
    remove(id: string): {
        id: string;
    };
    portfolio(id: string): {
        user: any;
        holdings: Record<string, {
            qty: number;
            spent: number;
        }>;
        marketValue: number;
        trades: import("../../store/data.store").Trade[];
    };
}
