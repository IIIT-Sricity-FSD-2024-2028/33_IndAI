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
exports.AssignInstructorDto = exports.UpdateConfigDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class UpdateConfigDto {
}
exports.UpdateConfigDto = UpdateConfigDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateConfigDto.prototype, "maxDailyTrades", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 150000, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateConfigDto.prototype, "defaultTradingLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateConfigDto.prototype, "maintenanceMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'IndAI', minLength: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], UpdateConfigDto.prototype, "platformName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 100000, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateConfigDto.prototype, "maxLimit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 200, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateConfigDto.prototype, "maxPts", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, minimum: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateConfigDto.prototype, "minMargin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 60, minimum: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateConfigDto.prototype, "cooldown", void 0);
class AssignInstructorDto {
}
exports.AssignInstructorDto = AssignInstructorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'u6' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'learnerId is required.' }),
    __metadata("design:type", String)
], AssignInstructorDto.prototype, "learnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'u3' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'instructorId is required.' }),
    __metadata("design:type", String)
], AssignInstructorDto.prototype, "instructorId", void 0);
//# sourceMappingURL=dto.js.map