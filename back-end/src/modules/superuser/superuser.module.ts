import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { SuperuserController } from './superuser.controller';
@Module({imports:[StoreModule], controllers:[SuperuserController]})
export class SuperuserModule {}
