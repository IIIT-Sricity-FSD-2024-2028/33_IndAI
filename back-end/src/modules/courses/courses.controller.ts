import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { CreateCourseDto, UpdateCourseDto } from './dto';
@ApiTags('Courses') @Controller('courses') @ApiRoleHeader()
export class CoursesController { constructor(private readonly service:CoursesService){}
 @Get() @Roles('superuser','admin','instructor','provider','learner') @ApiOperation({summary:'List courses'}) all(){return {success:true,data:this.service.findAll()};}
 @Get('published') @Roles('superuser','admin','instructor','provider','learner') @ApiOperation({summary:'List published courses'}) published(){return {success:true,data:this.service.findPublished()};}
 @Get('provider/:providerId') @Roles('superuser','admin','provider') @ApiOperation({summary:'List courses by provider'}) byProvider(@Param('providerId') providerId:string){return {success:true,data:this.service.findByProvider(providerId)};}
 @Get(':id') @Roles('superuser','admin','instructor','provider','learner') @ApiOperation({summary:'Get one course'}) one(@Param('id') id:string){return {success:true,data:this.service.findOne(id)};}
 @Post() @Roles('superuser','admin','provider') @ApiOperation({summary:'Create course'}) @ApiBody({type:CreateCourseDto}) create(@Body() b:CreateCourseDto){return {success:true,data:this.service.create(b)};}
 @Patch(':id') @Roles('superuser','admin','provider') @ApiOperation({summary:'Update course'}) @ApiBody({type:UpdateCourseDto}) update(@Param('id') id:string,@Body() b:UpdateCourseDto){return{success:true,data:this.service.update(id,b)};}
 @Delete(':id') @Roles('superuser','admin','provider') @ApiOperation({summary:'Delete course'}) remove(@Param('id') id:string){return{success:true,data:this.service.remove(id)};}
}
