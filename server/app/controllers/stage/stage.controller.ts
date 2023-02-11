import { DifferenceDetectionService } from '@app/services/difference-detection/difference-detection.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameDifficultyService } from '@app/services/game-difficulty/game-difficulty.service';
import { GameCardInformation } from '@common/game-card';
import { ImageUploadData } from '@common/image-upload-data';
import { ServerGeneratedGameInfo } from '@common/server-generated-game-info';
import { Body, Controller, Get, HttpStatus, Param, Post, Query, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
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
    constructor(
        public gameCardService: GameCardService,
        public differenceService: DifferenceDetectionService,
        public gameDifficultyService: GameDifficultyService,
    ) {}

    @Get('/')
    getStages(@Query('index') index: number, @Query('endIndex') endIndex: number): GameCardInformation[] {
        return this.gameCardService.getGameCards(index, endIndex);
    }

    @Get('/info')
    getNbOfStages(): number {
        return this.gameCardService.getGameCardsNumber();
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
    async uploadImages(@UploadedFiles() files: ImageUploadData, @Param() param, @Res() res: Response): Promise<void> {
        try {
            if (Object.keys(files).length) {
                const differenceArray = await this.differenceService.compareImages(
                    files.baseImage[0].path,
                    files.differenceImage[0].path,
                    param.radius,
                );
                if (this.gameDifficultyService.isGameValid(differenceArray)) {
                    const difficulty = this.gameDifficultyService.setGameDifficulty(differenceArray);

                    // TODO add differenceArray to difference array json with unique id => unique id returned by service call
                    const id = uuidv4();
                    const data: ServerGeneratedGameInfo = {
                        gameId: id,
                        originalImageName: files.baseImage[0].filename,
                        differenceImageName: files.differenceImage[0].filename,
                        gameDifficulty: difficulty,
                        gameDifferenceNumber: differenceArray.length,
                    };
                    res.status(HttpStatus.CREATED).send(data);
                } else {
                    // create method to call instead of using fs directly
                    fs.unlink(files.baseImage[0].path, (err) => {
                        if (err) throw err;
                    });
                    fs.unlink(files.differenceImage[0].path, (err) => {
                        if (err) throw err;
                    });
                    // Which status code to send?
                    res.status(HttpStatus.OK).send([]);
                }
            } else res.sendStatus(HttpStatus.BAD_REQUEST);
        } catch (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
        }
    }

    @Get('/image/:imageName')
    getImage(@Param() param, @Res() res: Response): void {
        try {
            const imagePath = join(process.cwd(), `assets/images/${param.imageName}`);
            res.status(HttpStatus.OK).sendFile(imagePath);
        } catch (err) {
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
