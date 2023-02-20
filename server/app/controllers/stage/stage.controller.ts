import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { DifferenceDetectionService } from '@app/services/difference-detection/difference-detection.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameDifficultyService } from '@app/services/game-difficulty/game-difficulty.service';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { GameCardInformation } from '@common/game-card';
import { ImageUploadData } from '@common/image-upload-data';
import { ServerGeneratedGameInfo } from '@common/server-generated-game-info';
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
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
    // eslint-disable-next-line max-params
    constructor(
        private gameCardService: GameCardService,
        private gameDifficultyService: GameDifficultyService,
        private imageManagerService: ImageManagerService,
        private differenceService: DifferenceDetectionService,
        private differenceClickService: DifferenceClickService,
    ) {}

    @Get('/')
    getStages(@Query('index') index: number, @Query('endIndex') endIndex: number, @Res() res: Response): void {
        try {
            res.status(HttpStatus.OK).send(this.gameCardService.getGameCards(index, endIndex));
        } catch (error) {
            throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/info')
    getNbOfStages(): number {
        try {
            return this.gameCardService.getGameCardsNumber();
        } catch {
            throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/:gameCardId')
    getStageById(@Param() param): GameCardInformation {
        try {
            return this.gameCardService.getGameCardById(param.gameCardId);
        } catch {
            throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
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
            throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
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
                const differencesArray = await this.differenceService.compareImages(
                    files.baseImage[0].path,
                    files.differenceImage[0].path,
                    param.radius,
                );

                const id = uuidv4();
                this.differenceClickService.createDifferenceArray(id, differencesArray);

                if (this.gameDifficultyService.isGameValid(differencesArray)) {
                    const difficulty = this.gameDifficultyService.setGameDifficulty(differencesArray);

                    const data: ServerGeneratedGameInfo = {
                        gameId: id,
                        originalImageName: files.baseImage[0].filename,
                        differenceImageName: files.differenceImage[0].filename,
                        gameDifficulty: difficulty,
                        gameDifferenceNumber: differencesArray.length,
                    };
                    res.status(HttpStatus.CREATED).send(data);
                } else {
                    this.imageManagerService.deleteImage(files.baseImage[0].path);
                    this.imageManagerService.deleteImage(files.differenceImage[0].path);
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
