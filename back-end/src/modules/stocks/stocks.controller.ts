import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StocksService } from './stocks.service';
import { ApiRoleHeader } from '../../common/swagger-role-header';

@ApiTags('Stocks')
@Controller('stocks')
@ApiRoleHeader()
export class StocksController {
  constructor(private readonly service: StocksService) {}

  @Get()
  @ApiOperation({summary:'List all stocks with live prices replayed from uploaded 1-minute CSV datasets'})
  findAll(@Query('q') q?:string, @Query('sector') sector?:string, @Query('cap') cap?:string){
    const rows = this.service.findAll(q, sector, cap);
    return {success:true, count:rows.length, data:rows};
  }

  @Get('live/tick')
  @ApiOperation({summary:'Get one live market tick. Prices, percentages, movers and volumes change automatically from CSV candles'})
  @ApiQuery({name:'symbols', required:false, description:'Optional comma-separated symbols like TCS,INFY,RELIANCE'})
  tick(@Query('symbols') symbols?:string){ return {success:true, data:this.service.tick(symbols)}; }

  @Get(':symbol')
  @ApiOperation({summary:'Get one live stock quote by symbol'})
  findOne(@Param('symbol') symbol:string){ return {success:true, data:this.service.findOne(symbol)}; }

  @Get(':symbol/candles')
  @ApiOperation({summary:'Get rolling minute-by-minute candles ending at current replay tick'})
  candles(@Param('symbol') symbol:string, @Query('limit') limit='240'){
    const rows = this.service.candles(symbol, +limit || 240);
    return {success:true, count:rows.length, data:rows};
  }
}

@ApiTags('Market')
@Controller('market')
@ApiRoleHeader()
export class MarketAliasController {
  constructor(private readonly service: StocksService) {}

  @Get('instruments') @ApiOperation({summary:'Alias: list market instruments'})
  instruments(@Query('q') q?:string, @Query('sector') sector?:string, @Query('cap') cap?:string){ const rows=this.service.findAll(q,sector,cap); return {success:true,count:rows.length,data:rows}; }

  @Get('instruments/:symbol') @ApiOperation({summary:'Alias: get market instrument by symbol'})
  instrument(@Param('symbol') symbol:string){ return {success:true,data:this.service.findOne(symbol)}; }

  @Get('prices') @ApiOperation({summary:'Alias: get live price tick for all instruments'})
  prices(@Query('symbols') symbols?:string){ return {success:true,data:this.service.tick(symbols)}; }

  @Patch('prices/:symbol') @ApiOperation({summary:'Demo endpoint: return latest live price for symbol'})
  patchPrice(@Param('symbol') symbol:string){ return {success:true,data:this.service.findOne(symbol)}; }
}
