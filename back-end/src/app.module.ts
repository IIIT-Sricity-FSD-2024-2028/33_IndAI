import {AccountModule} from './modules/account/account.module';
import { InstitutesModule } from './modules/institutes/institutes.module';
import { AlgoModule } from './modules/algo/algo.module';
import { PersistenceInterceptor } from './common/persistence.interceptor';
import { OwnershipGuard } from './common/ownership.guard';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { StoreModule } from './store/store.module';
import { RolesGuard } from './common/roles.guard';
import { JwtAuthGuard } from './common/jwt-auth.guard';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { MaintenanceModeMiddleware } from './common/middleware/maintenance-mode.middleware';
import { AdminAuditMiddleware } from './common/middleware/admin-audit.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StocksModule } from './modules/stocks/stocks.module';
import { TradesModule } from './modules/trades/trades.module';
import { WatchlistsModule } from './modules/watchlists/watchlists.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CourseModulesModule } from './modules/course-modules/course-modules.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { DiagnosticModule } from './modules/diagnostic/diagnostic.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AdminModule } from './modules/admin/admin.module';
import { SuperuserModule } from './modules/superuser/superuser.module';
import { CommercialModule } from './modules/commercial/commercial.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    StoreModule, AccountModule, InstitutesModule, AlgoModule,
    AuthModule,
    UsersModule,
    StocksModule,
    TradesModule,
    WatchlistsModule,
    CoursesModule,
    CourseModulesModule,
    EnrollmentsModule,
    DiagnosticModule,
    AssignmentsModule,
    SessionsModule,
    QuizzesModule,
    FeedbackModule,
    NotificationsModule,
    PortfolioModule,
    ReportsModule,
    AdminModule,
    SuperuserModule,
    CommercialModule,
    PaymentsModule,
  ],
  providers: [
    {provide:APP_INTERCEPTOR,useClass:PersistenceInterceptor},

    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    {provide:APP_GUARD,useClass:OwnershipGuard},
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        RequestIdMiddleware,
        RequestLoggerMiddleware,
        SecurityHeadersMiddleware,
        RateLimitMiddleware,
        MaintenanceModeMiddleware,
        AdminAuditMiddleware,
      )
      .forRoutes('{*path}');
  }
}
