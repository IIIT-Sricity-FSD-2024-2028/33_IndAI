import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WatchlistsService } from './watchlists.service';
import { Roles } from '../../common/roles.decorator';
import { ApiRoleHeader } from '../../common/swagger-role-header';
import { AddWatchlistSymbolDto, CreateWatchlistDto, UpdateWatchlistDto } from './dto';
@ApiTags('Watchlists') @Controller('watchlists') @ApiRoleHeader()
export class WatchlistsController { constructor(private readonly service:WatchlistsService){}
 @Get(':userId') @Roles('learner','instructor','admin','superuser') @ApiOperation({summary:'Get watchlists for user'}) list(@Param('userId') userId:string){return {success:true,data:this.service.list(userId)};}
 @Post(':userId') @Roles('learner','instructor','superuser') @ApiOperation({summary:'Create watchlist'}) @ApiBody({type:CreateWatchlistDto}) create(@Param('userId') userId:string,@Body() b:CreateWatchlistDto){return {success:true,data:this.service.create(userId,b)};}
 @Post(':userId/items') @Roles('learner','instructor','superuser') @ApiOperation({summary:'Add symbol to the first/default watchlist by user id'}) @ApiBody({type:AddWatchlistSymbolDto}) addItem(@Param('userId') userId:string,@Body() b:AddWatchlistSymbolDto){const list=this.service.list(userId)[0]; return {success:true,data:this.service.addSymbol(list.id,b.symbol)};}
 @Delete(':userId/items/:symbol') @Roles('learner','instructor','superuser') @ApiOperation({summary:'Remove symbol from the first/default watchlist by user id'}) removeItem(@Param('userId') userId:string,@Param('symbol') symbol:string){const list=this.service.list(userId)[0]; return {success:true,data:this.service.removeSymbol(list.id,symbol)};}
 @Patch(':id') @Roles('learner','instructor','superuser') @ApiOperation({summary:'Update watchlist symbols/name'}) @ApiBody({type:UpdateWatchlistDto}) update(@Param('id') id:string,@Body() b:UpdateWatchlistDto){return{success:true,data:this.service.update(id,b)};}
 @Post(':id/symbols/:symbol') @Roles('learner','instructor','superuser') @ApiOperation({summary:'Add symbol to watchlist'}) add(@Param('id') id:string,@Param('symbol') symbol:string){return{success:true,data:this.service.addSymbol(id,symbol)};}
 @Delete(':id/symbols/:symbol') @Roles('learner','instructor','superuser') @ApiOperation({summary:'Remove symbol from watchlist'}) remSym(@Param('id') id:string,@Param('symbol') symbol:string){return{success:true,data:this.service.removeSymbol(id,symbol)};}
 @Delete(':id') @Roles('learner','instructor','superuser') @ApiOperation({summary:'Delete watchlist'}) remove(@Param('id') id:string){return{success:true,data:this.service.remove(id)};}
}
