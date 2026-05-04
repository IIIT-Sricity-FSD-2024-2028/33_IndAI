import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { StoreModule } from './store/store.module';
import { RolesGuard } from './common/roles.guard';
import { RequestLoggerMiddleware } from './common/request-logger.middleware';
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

@Module({
  imports:[
    StoreModule,
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
  ],
  providers:[{provide:APP_GUARD,useClass:RolesGuard}],
})
export class AppModule implements NestModule { configure(consumer: MiddlewareConsumer){ consumer.apply(RequestLoggerMiddleware).forRoutes('*'); } }
