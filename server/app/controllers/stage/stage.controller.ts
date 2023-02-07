import { GameCardService } from '@app/services/game-card/game-card.service';
import { Body, Controller, Get, HttpStatus, Param, Post, Query, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// based on https://www.youtube.com/watch?v=f-URVd2OKYc
export const storage = diskStorage({
    destination: './assets/images',
    filename: (req, file, cb) => {
        const filename: string = uuidv4();
        const extension: string = path.parse(file.originalname).ext;
        cb(null, `${filename}${extension}`);
    },
});

@Controller('stage')
export class StageController {
    constructor(private gameCardService: GameCardService) {}
    @Get('/')
    getStages(@Query('index') index: number, @Query('endIndex') endIndex: number, @Res() res: Response): void {
        try {
            const stages = this.gameCardService.getGameCards(index, endIndex);
            if (stages) res.status(HttpStatus.OK).send(stages);
            else res.status(HttpStatus.NOT_FOUND).send({});
        } catch (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
        }
    }

    @Get('/info')
    getNbOfStages(@Res() res: Response): void {
        try {
            const gameNumber = this.gameCardService.getGameCardsNumber();
            // TODO send string of gameNumber cuz number was throwing an error.
            // Replace with { numberOfGameInformations: gameNumber } when sync with game - selection
            res.status(HttpStatus.OK).send(`${gameNumber}`);
        } catch (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
        }
    }

    @Post('/')
    createGame(@Body() game, @Res() res: Response) {
        try {
            if (Object.keys(game).length) {
                const newGame = this.gameCardService.createGameCard(game);
                res.status(HttpStatus.CREATED).send(newGame);
            } else res.sendStatus(HttpStatus.BAD_REQUEST);
        } catch (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
        }
    }

    @Post('/image/:radius')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'baseImage', maxCount: 1 },
                { name: 'differenceImage', maxCount: 1 },
            ],
            { storage },
        ),
    )
    uploadImages(@UploadedFiles() files, @Param() param, @Res() res: Response): void {
        // TODO ajouter appel au service qui va générer les images de différences
        const data = [files.baseImage[0], files.differenceImage[0]];
        res.status(HttpStatus.CREATED).send(data);
    }

    @Get('/image/:imageName')
    getImage(@Param() param, @Res() res: Response): void {
        const imagePath = join(process.cwd(), `assets/images/${param.imageName}`);
        res.sendFile(imagePath, (err) => {
            if (err) {
                res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        });
    }
}
