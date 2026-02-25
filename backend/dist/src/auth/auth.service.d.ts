import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export interface AuthResponse {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(email: string, name: string, password: string): Promise<AuthResponse>;
    login(email: string, password: string): Promise<AuthResponse>;
    private generateToken;
}
