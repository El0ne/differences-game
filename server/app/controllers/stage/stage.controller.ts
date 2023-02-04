import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameCardInformation } from '@common/game-card';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';

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

    @Post('/')
    createGame(@Body() game) {
        this.gameCardService.createGameCard(game);
        console.log(game);
    }
}
