/* eslint-disable no-underscore-dangle */
// using _id property causes linting warning
import { BestTimesService } from '@app/services/best-times/best-times.service';
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { DifferenceDetectionService } from '@app/services/difference-detection/difference-detection.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameDifficultyService } from '@app/services/game-difficulty/game-difficulty.service';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { GameCardDto } from '@common/game-card.dto';
import { ImageUploadDto } from '@common/image-upload.dto';
import { ImageDto } from '@common/image.dto';
import { ServerGeneratedGameInfo } from '@common/server-generated-game-info';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Res,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
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
    // need more than 3 services in the constructor
    // eslint-disable-next-line max-params
    constructor(
        private gameCardService: GameCardService,
        private gameDifficultyService: GameDifficultyService,
        private imageManagerService: ImageManagerService,
        private differenceService: DifferenceDetectionService,
        private differenceClickService: DifferenceClickService,
        private bestTimesService: BestTimesService,
    ) {}

    @Get('/')
    async getStages(@Query('index') index: number, @Query('endIndex') endIndex: number, @Res() res: Response): Promise<void> {
        try {
            const gameCards = await this.gameCardService.getGameCards(index, endIndex);
            res.status(HttpStatus.OK).send(gameCards);
        } catch (error) {
            throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/info')
    async getNbOfStages(): Promise<number> {
        try {
            return await this.gameCardService.getGameCardsNumber();
        } catch {
            throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('/:gameCardId')
    async getStageById(@Param() param, @Res() res: Response): Promise<void> {
        try {
            const gameCard = await this.gameCardService.getGameCardById(param.gameCardId);
            res.status(HttpStatus.OK).send(gameCard);
        } catch {
            throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/')
    async createGame(@Body() game: GameCardDto, @Res() res: Response): Promise<void> {
        try {
            if (Object.keys(game).length) {
                const newGame = await this.gameCardService.createGameCard(game);
                res.status(HttpStatus.CREATED).send(newGame);
            } else res.sendStatus(HttpStatus.BAD_REQUEST);
        } catch (err) {
            throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/image/:radius')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'file', maxCount: 2 }], { storage }))
    async uploadImages(@UploadedFiles() files: ImageUploadDto, @Param() param, @Res() res: Response): Promise<void> {
        try {
            if (Object.keys(files).length) {
                const fileArray: ImageDto[] = files.file;
                const differencesArray = await this.differenceService.compareImages(fileArray[0].path, fileArray[1].path, param.radius);
                if (this.gameDifficultyService.isGameValid(differencesArray)) {
                    const differenceObjectId = await this.differenceClickService.createDifferenceArray(differencesArray);
                    await this.imageManagerService.createImageObject(new ObjectId(differenceObjectId), fileArray[0].filename, fileArray[1].filename);
                    const difficulty = this.gameDifficultyService.setGameDifficulty(differencesArray);

                    const data: ServerGeneratedGameInfo = {
                        gameId: differenceObjectId,
                        originalImageName: fileArray[0].filename,
                        differenceImageName: fileArray[1].filename,
                        gameDifficulty: difficulty,
                        gameDifferenceNumber: differencesArray.length,
                    };
                    res.status(HttpStatus.CREATED).send(data);
                } else {
                    this.imageManagerService.deleteImage(fileArray[0].filename);
                    this.imageManagerService.deleteImage(fileArray[1].filename);
                    res.status(HttpStatus.OK).send([]);
                }
            } else res.sendStatus(HttpStatus.BAD_REQUEST);
        } catch (err) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
        }
    }

    @Get('/image/:imageName')
    async getImage(@Param() param, @Res() res: Response): Promise<void> {
        try {
            const imagePath = join(process.cwd(), `assets/images/${param.imageName}`);
            res.status(HttpStatus.OK).sendFile(imagePath);
        } catch (err) {
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete('/image/:imageName')
    async deleteImage(@Param() param, @Res() res: Response): Promise<void> {
        try {
            this.imageManagerService.deleteImage(param.imageName);
            res.status(HttpStatus.NO_CONTENT).send([]);
        } catch (err) {
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('/best-times')
    async resetAllBestTimes(@Res() res: Response): Promise<void> {
        try {
            await this.bestTimesService.resetAllBestTimes();
            res.status(HttpStatus.NO_CONTENT).send();
        } catch (err) {
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('/best-times/:id')
    async resetBestTimes(@Param('id') id: string, @Res() res: Response): Promise<void> {
        try {
            await this.bestTimesService.resetBestTimes(id);
            res.status(HttpStatus.NO_CONTENT).send();
        } catch (err) {
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // @Delete('/')
    // async deleteAllGames(@Res() res: Response): Promise<void> {
    //     try {
    //         await this.gameCardService.deleteAllGameCards();
    //         res.status(HttpStatus.NO_CONTENT).send();
    //     } catch (err) {
    //         res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }
}
