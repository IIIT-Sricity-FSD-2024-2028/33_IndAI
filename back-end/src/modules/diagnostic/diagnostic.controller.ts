import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataStore } from '../../store/data.store';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { SubmitDiagnosticDto } from './dto';
@ApiTags('Diagnostic') @Controller('diagnostic') @ApiRoleHeader()
export class DiagnosticController { constructor(private readonly db:DataStore){}
 @Post('submit') @Roles('superuser','learner') @ApiOperation({summary:'Submit diagnostic quiz and categorize learner'}) @ApiBody({type:SubmitDiagnosticDto}) submit(@Body() b:SubmitDiagnosticDto){ const learner=this.db.getUser(b.learnerId); if(!learner || learner.role !== 'learner') throw new NotFoundException('Learner not found.'); const score=b.score; const level=score<=40?'BEGINNER':score<=75?'INTERMEDIATE':'ADVANCED'; learner.learnerLevel=level; const row={id:this.db.id('d'),learnerId:b.learnerId,score,level,submittedAt:new Date().toISOString()}; this.db.diagnostics.push(row); return {success:true,data:row};}
 @Get('learner/:learnerId') @Roles('superuser','admin','instructor','learner') @ApiOperation({summary:'Get learner diagnostic results'}) get(@Param('learnerId') learnerId:string){return {success:true,data:this.db.diagnostics.filter((d:any)=>d.learnerId===learnerId)};}
}
