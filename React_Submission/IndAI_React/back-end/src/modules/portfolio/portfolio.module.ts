import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { UsersModule } from '../users/users.module';
import { PortfolioController } from './portfolio.controller';
@Module({imports:[StoreModule, UsersModule], controllers:[PortfolioController]})
export class PortfolioModule {}
