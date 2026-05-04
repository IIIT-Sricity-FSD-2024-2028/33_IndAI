import { DataStore } from '../../store/data.store';
import { LoginDto } from './dto';
export declare class AuthService {
    private readonly db;
    constructor(db: DataStore);
    login(dto: LoginDto): {
        user: any;
        session: {
            userId: string;
            role: import("../../store/data.store").Role;
            email: string;
            loginAt: string;
        };
    };
    me(userId: string): any;
}
