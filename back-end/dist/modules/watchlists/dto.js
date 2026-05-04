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
exports.AddWatchlistSymbolDto = exports.UpdateWatchlistDto = exports.CreateWatchlistDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const validation_constants_1 = require("../../common/validation.constants");
class CreateWatchlistDto {
}
exports.CreateWatchlistDto = CreateWatchlistDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Momentum Picks', minLength: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateWatchlistDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['TCS', 'INFY'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.Matches)(validation_constants_1.SYMBOL_REGEX, { each: true, message: 'Invalid stock symbol.' }),
    __metadata("design:type", Array)
], CreateWatchlistDto.prototype, "symbols", void 0);
class UpdateWatchlistDto {
}
exports.UpdateWatchlistDto = UpdateWatchlistDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minLength: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], UpdateWatchlistDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.Matches)(validation_constants_1.SYMBOL_REGEX, { each: true, message: 'Invalid stock symbol.' }),
    __metadata("design:type", Array)
], UpdateWatchlistDto.prototype, "symbols", void 0);
class AddWatchlistSymbolDto {
}
exports.AddWatchlistSymbolDto = AddWatchlistSymbolDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TCS' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Symbol is required.' }),
    (0, class_validator_1.Matches)(validation_constants_1.SYMBOL_REGEX, { message: 'Invalid stock symbol.' }),
    __metadata("design:type", String)
], AddWatchlistSymbolDto.prototype, "symbol", void 0);
//# sourceMappingURL=dto.js.map