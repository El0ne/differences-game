import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameCardInformation } from '@common/game-card';
import { Controller, Get, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// based on https://www.youtube.com/watch?v=f-URVd2OKYc
export const storage = diskStorage({
    destination: './assets/images',
    filename: (req, file, cb) => {
        console.log('file', file);
        if (file.mimetype === 'image/bmp') {
            console.log('here');
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
            const extension: string = path.parse(file.originalname).ext;
            cb(null, `${filename}${extension}`);
        } else {
            console.log('else');
        }
    },
});

export const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/bmp') {
        return cb(null, true);
    }
    return cb(null, false);
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

    @Post('/images')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'baseImage', maxCount: 2 }], {
            storage,
            // fileFilter,
        }),
    )
    createGame(@UploadedFiles() files) {
        // TODO ajouter appel au service qui va générer les images de différences
        // this.gameCardService.createGameCard(files.gameData);
        console.log('test');
        console.log('files', files);
        return [files.baseImage[0], files.baseImage[1]];
    }
}
