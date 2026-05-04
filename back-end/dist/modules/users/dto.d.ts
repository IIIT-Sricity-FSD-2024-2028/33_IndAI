export declare class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: any;
    status?: string;
    phone?: string;
    dateOfBirth?: string;
    institution?: string;
    studentId?: string;
    grade?: string;
    major?: string;
    organization?: string;
    expertise?: string;
    yearsExp?: string;
    website?: string;
    contentType?: string;
    authCode?: string;
    accessLevel?: string;
    tradingExperience?: string;
    riskTolerance?: string;
    startingBalance?: number;
    tradingLimit?: number;
    instructorId?: string;
    skillPoints?: number;
    portfolioValue?: number;
    virtualBalance?: number;
    experience?: string;
    goals?: string;
    studentIds?: string[];
}
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    status?: string;
    phone?: string;
    tradingLimit?: number;
    skillPoints?: number;
    instructorId?: string;
    institution?: string;
    major?: string;
}
