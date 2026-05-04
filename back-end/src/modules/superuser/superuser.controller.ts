import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataStore } from '../../store/data.store';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
@ApiTags('Superuser') @Controller('superuser') @ApiRoleHeader()
export class SuperuserController { constructor(private readonly db: DataStore) {}
 @Get('overview') @Roles('superuser') @ApiOperation({summary:'Super User system overview'}) overview(){ return {success:true,data:{users:this.db.users.length,courses:this.db.courses.length,trades:this.db.trades.length,notifications:this.db.notifications.length}}; }
 @Get('all-data') @Roles('superuser') @ApiOperation({summary:'Super User full in-memory repository snapshot'}) allData(){ const users=this.db.users.map(u=>this.db.safeUser(u)); return {success:true,data:{...this.db, users}}; }
 @Post('reset-demo-data') @Roles('superuser') @ApiOperation({summary:'Reset demo data by restarting in-memory seed'}) reset(){ this.db.onModuleInit(); return {success:true,message:'Demo data reset'}; }
}
