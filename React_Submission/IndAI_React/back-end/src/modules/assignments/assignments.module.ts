import { Module } from '@nestjs/common';
import { StoreModule } from '../../store/store.module';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
@Module({ imports:[StoreModule], controllers:[AssignmentsController], providers:[AssignmentsService] })
export class AssignmentsModule {}
