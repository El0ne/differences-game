import { GameConstants } from '@common/game-constants';
import { Body, Controller, Get, Put } from '@nestjs/common';

@Controller('game-constants')
export class GameConstantsController {
    @Get('/')
    getGameConstants(): void {
        console.log('terry cruz');
    }

    @Put('/')
    updateGameConstants(@Body() gameConstants: GameConstants) {
        console.log('gameConstants', gameConstants);
    }
}
