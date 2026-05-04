import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
@Module({ imports:[StoreModule], controllers:[NotificationsController], providers:[NotificationsService] })
export class NotificationsModule {}
