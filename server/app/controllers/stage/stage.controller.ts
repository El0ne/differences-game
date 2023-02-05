import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameCardInformation } from '@common/game-card';
import { GameInformation } from '@common/game-information';
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
    createGame(@Body() game: GameInformation): GameCardInformation {
        // TODO ajouter appel au service qui va générer les images de différences
        return this.gameCardService.createGameCard(game);
    }

    @Post('/image')
    test(@Body() e) {
        console.log('e', e);
        return e;
    }
    // @UseInterceptors(FileInterceptor('image'))
    // uploadImage(@UploadedFile() file): void {
    //     console.log('test', file);
    // }
}
