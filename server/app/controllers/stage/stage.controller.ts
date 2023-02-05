import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameCardInformation } from '@common/game-card';
import { Controller, Get, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
const multer = require('multer');
// based on https://www.youtube.com/watch?v=f-URVd2OKYc
// export const storage = {
//     storage: diskStorage({
//         destination: './assets/images',
//         filename: (req, file, cb) => {
//             const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
//             const extension: string = path.parse(file.originalname).ext;
//             cb(null, `${filename}${extension}`);
//         },
//     }),
// };

// export const upload = multer({
//     storage,
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype === 'image/bmp') {
//             cb(null, true);
//         } else {
//             cb(null, false);
//         }
//     },
// });

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
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'baseImage', maxCount: 1 },
                { name: 'gameData', maxCount: 1 },
            ],
            {
                storage: diskStorage({
                    destination: './assets/images',
                    filename: (req, file, cb) => {
                        const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
                        const extension: string = path.parse(file.originalname).ext;
                        cb(null, `${filename}${extension}`);
                    },
                }),
                fileFilter: (req, file, cb) => {
                    // Check if the file should be accepted or not
                    if (file.fieldname !== 'gameData') {
                        return cb(null, true);
                    }
                    return cb(null, false);
                },
            },
        ),
    )
    createGame(@UploadedFiles() files: { baseImage?: File; gameData?: File }) {
        // TODO ajouter appel au service qui va générer les images de différences
        // this.gameCardService.createGameCard(files.gameData);
        return files;
    }
}
