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
exports.UpdateSessionDto = exports.CreateSessionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const validation_constants_1 = require("../../common/validation.constants");
class CreateSessionDto {
}
exports.CreateSessionDto = CreateSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'u3' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Instructor ID is required.' }),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "instructorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Live Trading Practice', minLength: 3 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Session title must be at least 3 characters.' }),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Practice session', minLength: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-10', description: 'Must be a future date within 365 days.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Session date is required.' }),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10:00' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Time is required.' }),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Time must be in HH:mm format.' }),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['u6'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateSessionDto.prototype, "studentIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 60, minimum: 15, maximum: 480 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(15),
    (0, class_validator_1.Max)(480),
    __metadata("design:type", Number)
], CreateSessionDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: validation_constants_1.SESSION_STATUSES, example: 'scheduled' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(validation_constants_1.SESSION_STATUSES, { message: 'Invalid session status.' }),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Trading Session' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSessionDto.prototype, "type", void 0);
class UpdateSessionDto {
}
exports.UpdateSessionDto = UpdateSessionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSessionDto.prototype, "instructorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minLength: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], UpdateSessionDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minLength: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], UpdateSessionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSessionDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Time must be in HH:mm format.' }),
    __metadata("design:type", String)
], UpdateSessionDto.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateSessionDto.prototype, "studentIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 15, maximum: 480 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(15),
    (0, class_validator_1.Max)(480),
    __metadata("design:type", Number)
], UpdateSessionDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: validation_constants_1.SESSION_STATUSES }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(validation_constants_1.SESSION_STATUSES),
    __metadata("design:type", String)
], UpdateSessionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSessionDto.prototype, "type", void 0);
//# sourceMappingURL=dto.js.map