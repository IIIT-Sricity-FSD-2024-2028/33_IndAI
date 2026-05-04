import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
@Module({ imports:[StoreModule], controllers:[SessionsController], providers:[SessionsService] })
export class SessionsModule {}
