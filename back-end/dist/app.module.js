"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const store_module_1 = require("./store/store.module");
const roles_guard_1 = require("./common/roles.guard");
const request_logger_middleware_1 = require("./common/request-logger.middleware");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const stocks_module_1 = require("./modules/stocks/stocks.module");
const trades_module_1 = require("./modules/trades/trades.module");
const watchlists_module_1 = require("./modules/watchlists/watchlists.module");
const courses_module_1 = require("./modules/courses/courses.module");
const course_modules_module_1 = require("./modules/course-modules/course-modules.module");
const enrollments_module_1 = require("./modules/enrollments/enrollments.module");
const diagnostic_module_1 = require("./modules/diagnostic/diagnostic.module");
const assignments_module_1 = require("./modules/assignments/assignments.module");
const sessions_module_1 = require("./modules/sessions/sessions.module");
const quizzes_module_1 = require("./modules/quizzes/quizzes.module");
const feedback_module_1 = require("./modules/feedback/feedback.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const portfolio_module_1 = require("./modules/portfolio/portfolio.module");
const reports_module_1 = require("./modules/reports/reports.module");
const admin_module_1 = require("./modules/admin/admin.module");
const superuser_module_1 = require("./modules/superuser/superuser.module");
let AppModule = class AppModule {
    configure(consumer) { consumer.apply(request_logger_middleware_1.RequestLoggerMiddleware).forRoutes('*'); }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            store_module_1.StoreModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            stocks_module_1.StocksModule,
            trades_module_1.TradesModule,
            watchlists_module_1.WatchlistsModule,
            courses_module_1.CoursesModule,
            course_modules_module_1.CourseModulesModule,
            enrollments_module_1.EnrollmentsModule,
            diagnostic_module_1.DiagnosticModule,
            assignments_module_1.AssignmentsModule,
            sessions_module_1.SessionsModule,
            quizzes_module_1.QuizzesModule,
            feedback_module_1.FeedbackModule,
            notifications_module_1.NotificationsModule,
            portfolio_module_1.PortfolioModule,
            reports_module_1.ReportsModule,
            admin_module_1.AdminModule,
            superuser_module_1.SuperuserModule,
        ],
        providers: [{ provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map