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
exports.CreateOrderDto = exports.CreateTradeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const validation_constants_1 = require("../../common/validation.constants");
class CreateTradeDto {
}
exports.CreateTradeDto = CreateTradeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'u6' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Learner ID is required.' }),
    __metadata("design:type", String)
], CreateTradeDto.prototype, "learnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TCS' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Symbol is required.' }),
    (0, class_validator_1.Matches)(validation_constants_1.SYMBOL_REGEX, { message: 'Invalid stock symbol.' }),
    __metadata("design:type", String)
], CreateTradeDto.prototype, "symbol", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['BUY', 'SELL'] }),
    (0, class_validator_1.IsIn)(['BUY', 'SELL'], { message: 'Order type must be BUY or SELL.' }),
    __metadata("design:type", String)
], CreateTradeDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['MARKET', 'LIMIT', 'STOP_LOSS'], example: 'MARKET' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['MARKET', 'LIMIT', 'STOP_LOSS'], { message: 'Invalid order category.' }),
    __metadata("design:type", String)
], CreateTradeDto.prototype, "orderCategory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, minimum: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Quantity must be a positive whole number.' }),
    (0, class_validator_1.IsPositive)({ message: 'Quantity must be a positive whole number.' }),
    __metadata("design:type", Number)
], CreateTradeDto.prototype, "qty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3850, minimum: 0.01 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)({ message: 'Price must be positive.' }),
    __metadata("design:type", Number)
], CreateTradeDto.prototype, "price", void 0);
class CreateOrderDto {
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'u6' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Learner ID is required.' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "learnerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TCS' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Symbol is required.' }),
    (0, class_validator_1.Matches)(validation_constants_1.SYMBOL_REGEX, { message: 'Invalid stock symbol.' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "symbol", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['BUY', 'SELL'] }),
    (0, class_validator_1.IsIn)(['BUY', 'SELL'], { message: 'Order type must be BUY or SELL.' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "orderType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['MARKET', 'LIMIT', 'STOP_LOSS'], example: 'MARKET' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['MARKET', 'LIMIT', 'STOP_LOSS'], { message: 'Invalid order category.' }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "orderCategory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, minimum: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Quantity must be a positive whole number.' }),
    (0, class_validator_1.IsPositive)({ message: 'Quantity must be a positive whole number.' }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3850, minimum: 0.01 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)({ message: 'Price must be positive.' }),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "price", void 0);
//# sourceMappingURL=dto.js.map