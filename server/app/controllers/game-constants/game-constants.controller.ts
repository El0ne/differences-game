import { GameConstantService } from '@app/services/game-constant/game-constant.service';
import { GameConstants } from '@common/game-constants';
import { Body, Controller, Get, Put } from '@nestjs/common';

@Controller('game-constants')
export class GameConstantsController {
    constructor(private gameConstantService: GameConstantService) {}

    @Get('/')
    getGameConstants(): GameConstants {
        return this.gameConstantService.getGameConstants();
    }

    @Put('/')
    updateGameConstants(@Body() gameConstants: GameConstants): void {
        this.gameConstantService.updateGameConstants(gameConstants);
    }
}
