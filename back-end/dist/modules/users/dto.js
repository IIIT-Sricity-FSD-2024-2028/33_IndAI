"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserDto = exports.CreateUserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const validation_constants_1 = require("../../common/validation.constants");
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'New', minLength: 3, description: 'Required. Alphabets and spaces only.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'First name is required.' }),
    (0, class_validator_1.MinLength)(3, { message: 'First name must be at least 3 characters.' }),
    (0, class_validator_1.Matches)(validation_constants_1.NAME_REGEX, { message: 'First name can contain only alphabets and spaces.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Learner', minLength: 3, description: 'Required. Alphabets and spaces only.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Last name is required.' }),
    (0, class_validator_1.MinLength)(3, { message: 'Last name must be at least 3 characters.' }),
    (0, class_validator_1.Matches)(validation_constants_1.NAME_REGEX, { message: 'Last name can contain only alphabets and spaces.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'new@gmail.com', description: 'Required. Gmail or .in email only.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required.' }),
    (0, class_validator_1.Matches)(validation_constants_1.INDAI_EMAIL_REGEX, { message: 'Use a Gmail address or an email ending in .in.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Test@1234', minLength: 8, description: 'Required. Min 8 chars, uppercase, lowercase, number, and one of !@#$%^&*.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required.' }),
    (0, class_validator_1.Matches)(validation_constants_1.PASSWORD_REGEX, { message: 'Password must be at least 8 characters and include uppercase, lowercase, number and special character.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: validation_constants_1.USER_ROLES }),
    (0, class_validator_1.IsIn)(validation_constants_1.USER_ROLES, { message: 'Invalid role.' }),
    __metadata("design:type", Object)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: validation_constants_1.USER_STATUSES, example: 'active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(validation_constants_1.USER_STATUSES, { message: 'Invalid status.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '9876543210', description: 'Optional but if provided must be 10 digits starting with 6/7/8/9.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(validation_constants_1.INDIAN_PHONE_REGEX, { message: 'Enter a valid 10-digit Indian mobile number.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2007-05-09', description: 'Required by registration frontend. Learner must be at least 10 years old.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Date of Birth must be a valid date.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'IIIT Sri City', minLength: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Institution name must be at least 3 characters.' }),
    (0, class_validator_1.Matches)(/^[^0-9].*$/, { message: 'Institution name cannot start with a number.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "institution", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'CSE2026', minLength: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Student ID must be at least 3 characters.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'BTech 2nd Year', minLength: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Grade / Level must be at least 3 characters.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "grade", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Computer Science', minLength: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Course / Major must be at least 3 characters when provided.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "major", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'IndAI Academy', minLength: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Organization name must be at least 3 characters.' }),
    (0, class_validator_1.Matches)(/^[^0-9].*$/, { message: 'Organization cannot start with a number.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "organization", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Technical Analysis', minLength: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Expertise / Specialization must be at least 3 characters.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "expertise", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '3-5' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Years of experience is required for instructors.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "yearsExp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({ require_protocol: true, protocols: ['http', 'https'] }, { message: 'Website / LinkedIn must be a valid URL starting with http:// or https://.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Video Courses' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ADMIN-2026' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Authorization code is required.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "authCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Full' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Admin access level is required.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "accessLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: validation_constants_1.EXPERIENCE_LEVELS }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(validation_constants_1.EXPERIENCE_LEVELS, { message: 'Invalid experience level.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "tradingExperience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: validation_constants_1.RISK_TOLERANCES }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(validation_constants_1.RISK_TOLERANCES, { message: 'Invalid risk tolerance.' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "riskTolerance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 100000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "startingBalance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 150000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "tradingLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'u3' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "instructorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "skillPoints", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 100000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "portfolioValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 100000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "virtualBalance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Beginner' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "experience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Learn paper trading safely' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "goals", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: [] }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateUserDto.prototype, "studentIds", void 0);
class UpdateUserDto {
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.Matches)(validation_constants_1.NAME_REGEX, { message: 'First name can contain only alphabets and spaces.' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.Matches)(validation_constants_1.NAME_REGEX, { message: 'Last name can contain only alphabets and spaces.' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(validation_constants_1.INDAI_EMAIL_REGEX, { message: 'Use a Gmail address or an email ending in .in.' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: validation_constants_1.USER_STATUSES }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(validation_constants_1.USER_STATUSES),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(validation_constants_1.INDIAN_PHONE_REGEX, { message: 'Enter a valid 10-digit Indian mobile number.' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "tradingLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "skillPoints", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "instructorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.Matches)(/^[^0-9].*$/, { message: 'Institution name cannot start with a number.' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "institution", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "major", void 0);
//# sourceMappingURL=dto.js.map