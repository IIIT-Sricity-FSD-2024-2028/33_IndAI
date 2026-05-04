"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizzesModule = void 0;
const common_1 = require("@nestjs/common");
const store_module_1 = require("../../store/store.module");
const quizzes_controller_1 = require("./quizzes.controller");
let QuizzesModule = class QuizzesModule {
};
exports.QuizzesModule = QuizzesModule;
exports.QuizzesModule = QuizzesModule = __decorate([
    (0, common_1.Module)({ imports: [store_module_1.StoreModule], controllers: [quizzes_controller_1.QuizzesController] })
], QuizzesModule);
//# sourceMappingURL=quizzes.module.js.map