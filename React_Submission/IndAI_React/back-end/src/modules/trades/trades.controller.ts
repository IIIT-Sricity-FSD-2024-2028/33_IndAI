import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TradesService } from './trades.service';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { CreateOrderDto, CreateTradeDto } from './dto';
@ApiTags('Trades') @Controller('trades') @ApiRoleHeader()
export class TradesController {
  constructor(private readonly service: TradesService) {}
  @Get() @Roles('superuser','admin','instructor') @ApiOperation({summary:'List all trades'})
  all(){ return {success:true, data:this.service.findAll()}; }
  @Get('user/:userId') @Roles('superuser','admin','instructor','learner') @ApiOperation({summary:'List learner trades'})
  byUser(@Param('userId') userId:string){ return {success:true, data:this.service.findByUser(userId)}; }
  @Post() @Roles('learner','instructor','superuser') @ApiOperation({summary:'Execute paper BUY/SELL order'}) @ApiBody({type:CreateTradeDto})
  create(@Body() dto:CreateTradeDto){ return { success:true, data:this.service.execute(dto) }; }
}

@ApiTags('Trading') @Controller('trading') @ApiRoleHeader()
export class TradingAliasController {
  constructor(private readonly service: TradesService) {}
  @Get('orders') @Roles('superuser','admin','instructor') @ApiOperation({summary:'Alias: list all orders/trades'}) allOrders(){ return {success:true,data:this.service.findAll()}; }
  @Get('orders/learner/:learnerId') @Roles('superuser','admin','instructor','learner') @ApiOperation({summary:'Alias: list learner orders/trades'}) learnerOrders(@Param('learnerId') id:string){ return {success:true,data:this.service.findByUser(id)}; }
  @Get('trades') @Roles('superuser','admin','instructor') @ApiOperation({summary:'Alias: list all trades'}) allTrades(){ return {success:true,data:this.service.findAll()}; }
  @Get('trades/learner/:learnerId') @Roles('superuser','admin','instructor','learner') @ApiOperation({summary:'Alias: list learner trades'}) learnerTrades(@Param('learnerId') id:string){ return {success:true,data:this.service.findByUser(id)}; }
  @Post('orders') @Roles('learner','instructor','superuser') @ApiOperation({summary:'Alias: place paper trading order'}) @ApiBody({type:CreateOrderDto})
  order(@Body() dto:CreateOrderDto){ return {success:true,data:this.service.execute({learnerId:dto.learnerId,symbol:dto.symbol,type:dto.orderType,qty:dto.quantity,price:dto.price,orderCategory:dto.orderCategory})}; }
}
