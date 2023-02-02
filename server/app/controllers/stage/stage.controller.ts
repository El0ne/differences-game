import { GAMES } from '@app/dataBase/stages';
import { GameCardService } from '@app/services/game-card/game-card/game-card.service';
import { GameCardInformation } from '@common/game-card';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('stage')
export class StageController {
    constructor(private gameCardService: GameCardService) {}
    @Get()
    test(@Query('index') index: number, @Query('endIndex') endIndex: number): GameCardInformation[] {
        console.log('index', index);
        console.log('endIndex', endIndex);
        return this.gameCardService.getGameCards(index, endIndex);
    }

    @Get('info')
    getNbOfStages(): number {
        return GAMES.length;
    }
}
