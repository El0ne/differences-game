import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameCardInformation } from '@common/game-card';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('stage')
export class StageController {
    constructor(private gameCardService: GameCardService) {}
    @Get('/')
    getStages(@Query('index') index: number, @Query('endIndex') endIndex: number): GameCardInformation[] {
        return this.gameCardService.getGameCards(index, endIndex);
    }

    @Get('/info')
    getNbOfStages(): number {
        return this.gameCardService.getGameCardsNumber();
    }
}
