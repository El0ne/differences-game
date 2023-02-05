import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameCardInformation } from '@common/game-card';
import { GameInformation } from '@common/game-information';
import { ImageInformation } from '@common/image-information';
import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');

// based on https://www.youtube.com/watch?v=f-URVd2OKYc
export const storage = {
    storage: diskStorage({
        destination: './assets/images',
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
            const extension: string = path.parse(file.originalname).ext;
            cb(null, `${filename}${extension}`);
        },
    }),
};

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
    @UseInterceptors(FileInterceptor('image', storage))
    uploadImage(@UploadedFile() file: ImageInformation): ImageInformation {
        return file;
    }
}
