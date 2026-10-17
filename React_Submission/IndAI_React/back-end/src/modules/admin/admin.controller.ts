import { BadRequestException, Body, Controller, ForbiddenException, Get, Headers, NotFoundException, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataStore } from '../../store/data.store';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { AssignInstructorDto, UpdateConfigDto } from './dto';

@ApiTags('Admin')
@Controller('admin')
@ApiRoleHeader()
export class AdminController {
  constructor(private readonly db: DataStore) {}

  private requireUserAdmin(userId?:string){ const u=userId?this.db.getUser(userId):null; if(!u || !((u.role==='admin'&&u.adminTeam==='USER_ADMIN')||u.role==='superuser')) throw new ForbiddenException('User Admin or Super Admin access required.'); }
  private requireSuper(userId?:string){ const u=userId?this.db.getUser(userId):null; if(!u || u.role!=='superuser') throw new ForbiddenException('Super Admin access required.'); }

  @Get('config')
  @Roles('superuser','admin')
  @ApiOperation({summary:'Get platform config'})
  config(){
    return {success:true,data:this.db.config};
  }

  @Patch('config')
  @Roles('superuser','admin')
  @ApiOperation({summary:'Update platform config'})
  @ApiBody({type:UpdateConfigDto})
  updateConfig(@Body() body:UpdateConfigDto, @Headers('x-user-id') userId?:string){
    this.requireSuper(userId);
    if (!body || Object.keys(body).length === 0) throw new BadRequestException('At least one config field is required.');
    Object.assign(this.db.config, body);
    return {success:true,data:this.db.config};
  }

  @Post('assign-instructor')
  @Roles('superuser','admin')
  @ApiOperation({summary:'Assign instructor to learner'})
  @ApiBody({type:AssignInstructorDto})
  assign(@Body() body:AssignInstructorDto, @Headers('x-user-id') userId?:string){
    this.requireUserAdmin(userId);
    const learner=this.db.getUser(body.learnerId);
    if(!learner || learner.role !== 'learner') throw new NotFoundException('Learner not found.');
    const instructor=this.db.getUser(body.instructorId);
    if(!instructor || instructor.role !== 'instructor') throw new NotFoundException('Instructor not found.');
    learner.instructorId=instructor.id;
    instructor.studentIds=[...new Set([...(instructor.studentIds||[]), learner.id])];
    return {success:true,data:{learner:this.db.safeUser(learner),instructor:this.db.safeUser(instructor)}};
  }
}
