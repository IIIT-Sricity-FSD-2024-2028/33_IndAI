"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistsModule = void 0;
const common_1 = require("@nestjs/common");
const store_module_1 = require("../../store/store.module");
const watchlists_controller_1 = require("./watchlists.controller");
const watchlists_service_1 = require("./watchlists.service");
let WatchlistsModule = class WatchlistsModule {
};
exports.WatchlistsModule = WatchlistsModule;
exports.WatchlistsModule = WatchlistsModule = __decorate([
    (0, common_1.Module)({ imports: [store_module_1.StoreModule], controllers: [watchlists_controller_1.WatchlistsController], providers: [watchlists_service_1.WatchlistsService] })
], WatchlistsModule);
//# sourceMappingURL=watchlists.module.js.map