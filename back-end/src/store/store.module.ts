import { Module } from '@nestjs/common';
import { DataStore } from './data.store';
@Module({ providers:[DataStore], exports:[DataStore] })
export class StoreModule {}
