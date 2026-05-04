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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const data_store_1 = require("../../store/data.store");
let NotificationsService = class NotificationsService {
    constructor(db) {
        this.db = db;
    }
    findAll() { return this.db.notifications; }
    findByUser(userId) { return this.db.notifications.filter((n) => n.userId === userId); }
    findOne(id) { const row = this.db.notifications.find((x) => x.id === id); if (!row)
        throw new common_1.NotFoundException('Notification not found.'); return row; }
    create(body) { const user = this.db.getUser(body.userId); if (!user)
        throw new common_1.NotFoundException('User not found.'); const row = { id: this.db.id('n'), read: false, type: 'info', ...body, message: body.message.trim(), createdAt: new Date().toISOString() }; this.db.notifications.push(row); return row; }
    update(id, body) { const row = this.findOne(id); Object.assign(row, body); return row; }
    markRead(id) { const row = this.findOne(id); row.read = true; return row; }
    remove(id) { const idx = this.db.notifications.findIndex((x) => x.id === id); if (idx === -1)
        throw new common_1.NotFoundException('Notification not found.'); this.db.notifications.splice(idx, 1); return { id }; }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [data_store_1.DataStore])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map