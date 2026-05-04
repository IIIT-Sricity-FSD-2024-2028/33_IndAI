import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { CreateUserDto, UpdateUserDto } from './dto';

@ApiTags('Users')
@Controller('users')
@ApiRoleHeader()
export class UsersController {
  constructor(private readonly service:UsersService){}

  @Get() @Roles('superuser','admin','instructor') @ApiOperation({summary:'List users'})
  all(){return {success:true,data:this.service.findAll()};}

  @Get('role/:role') @Roles('superuser','admin','instructor') @ApiOperation({summary:'List users by role'})
  byRole(@Param('role') role:string){return {success:true,data:this.service.findByRole(role)};}

  @Get(':id') @Roles('superuser','admin','instructor','learner','provider') @ApiOperation({summary:'Get user by id'})
  one(@Param('id') id:string){return {success:true,data:this.service.findOne(id)};}

  @Post() @Roles('superuser','admin') @ApiOperation({summary:'Create user'}) @ApiBody({type:CreateUserDto})
  create(@Body() dto:CreateUserDto){return {success:true,data:this.service.create(dto)};}

  @Post('register') @ApiOperation({summary:'Public registration endpoint'}) @ApiBody({type:CreateUserDto})
  register(@Body() dto:CreateUserDto){return {success:true,data:this.service.create(dto)};}

  @Patch(':id') @Roles('superuser','admin','instructor') @ApiOperation({summary:'Update user'}) @ApiBody({type:UpdateUserDto})
  update(@Param('id') id:string,@Body() dto:UpdateUserDto){return {success:true,data:this.service.update(id,dto)};}

  @Delete(':id') @Roles('superuser','admin') @ApiOperation({summary:'Delete user'})
  remove(@Param('id') id:string){return {success:true,data:this.service.remove(id)};}

  @Get(':id/portfolio') @Roles('superuser','admin','instructor','learner') @ApiOperation({summary:'Get learner portfolio, holdings and trades'})
  portfolio(@Param('id') id:string){return {success:true,data:this.service.portfolio(id)};}
}
