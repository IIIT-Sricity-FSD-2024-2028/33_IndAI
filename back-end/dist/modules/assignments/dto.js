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
exports.SubmitAssignmentDto = exports.UpdateAssignmentDto = exports.CreateAssignmentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const validation_constants_1 = require("../../common/validation.constants");
class CreateAssignmentDto {
}
exports.CreateAssignmentDto = CreateAssignmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Trading Plan', minLength: 3 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Submit a paper trade plan.', minLength: 3 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'u3' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Instructor ID is required.' }),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "instructorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['u6'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateAssignmentDto.prototype, "studentIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-20', description: 'Must be a future date within 365 days.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Due date is required.' }),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50, minimum: 1, maximum: 200 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], CreateAssignmentDto.prototype, "skillPoints", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: validation_constants_1.DIFFICULTIES, example: 'Medium' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(validation_constants_1.DIFFICULTIES, { message: 'Invalid difficulty.' }),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "difficulty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: validation_constants_1.ASSIGNMENT_STATUSES, example: 'active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(validation_constants_1.ASSIGNMENT_STATUSES, { message: 'Invalid assignment status.' }),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Trading Challenge' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "type", void 0);
class UpdateAssignmentDto {
}
exports.UpdateAssignmentDto = UpdateAssignmentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minLength: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], UpdateAssignmentDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minLength: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], UpdateAssignmentDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAssignmentDto.prototype, "instructorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateAssignmentDto.prototype, "studentIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAssignmentDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, maximum: 200 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], UpdateAssignmentDto.prototype, "skillPoints", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: validation_constants_1.DIFFICULTIES }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(validation_constants_1.DIFFICULTIES),
    __metadata("design:type", String)
], UpdateAssignmentDto.prototype, "difficulty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: validation_constants_1.ASSIGNMENT_STATUSES }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(validation_constants_1.ASSIGNMENT_STATUSES),
    __metadata("design:type", String)
], UpdateAssignmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAssignmentDto.prototype, "type", void 0);
class SubmitAssignmentDto {
}
exports.SubmitAssignmentDto = SubmitAssignmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'u6' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'learnerId is required.' }),
    __metadata("design:type", String)
], SubmitAssignmentDto.prototype, "learnerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'My solution text' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitAssignmentDto.prototype, "submissionText", void 0);
//# sourceMappingURL=dto.js.map