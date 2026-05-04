import { AuthService } from './auth.service';
import { LoginDto } from './dto';
export declare class AuthController {
    private readonly service;
    constructor(service: AuthService);
    login(dto: LoginDto): {
        success: boolean;
        data: {
            user: any;
            session: {
                userId: string;
                role: import("../../store/data.store").Role;
                email: string;
                loginAt: string;
            };
        };
    };
    me(userId: string): {
        success: boolean;
        data: any;
    };
}
