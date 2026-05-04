import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { UsersService } from '../users/users.service';
@ApiTags('Portfolio') @Controller('portfolio') @ApiRoleHeader()
export class PortfolioController { constructor(private readonly users: UsersService) {}
 @Get(':learnerId') @Roles('superuser','admin','instructor','learner') @ApiOperation({summary:'Get learner portfolio'}) one(@Param('learnerId') id:string){return {success:true,data:this.users.portfolio(id)};}
 @Get(':learnerId/holdings') @Roles('superuser','admin','instructor','learner') @ApiOperation({summary:'Get learner holdings'}) holdings(@Param('learnerId') id:string){return {success:true,data:this.users.portfolio(id).holdings};}
 @Get(':learnerId/performance') @Roles('superuser','admin','instructor','learner') @ApiOperation({summary:'Get learner performance summary'}) performance(@Param('learnerId') id:string){const p=this.users.portfolio(id); const trades=p.trades||[]; const profitable=trades.filter((t:any)=>t.type==='SELL').length; return {success:true,data:{portfolioValue:p.user.portfolioValue,virtualBalance:p.user.virtualBalance,totalTrades:trades.length,profitableTrades:profitable,marketValue:p.marketValue}};}
}
