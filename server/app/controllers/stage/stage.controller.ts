/* eslint-disable no-underscore-dangle */
// using _id property causes linting warning
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { DifferenceDetectionService } from '@app/services/difference-detection/difference-detection.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameDifficultyService } from '@app/services/game-difficulty/game-difficulty.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { GameCardDto } from '@common/game-card.dto';
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
        private gameManagerService: GameManagerService,
    ) {}

    // TODO: Remove when we replace with sockets later
    @Put('/end-game')
    endGame(@Body() id) {
        this.gameManagerService.endGame(id.gameId);
    }

    // TODO: Remove when we replace with sockets later
    @Put('/start-game')
    startGame(@Body() id) {
        this.gameManagerService.addGame(id.gameId);
    }

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

    @Delete('/:gameCardId')
    async deleteGame(@Param() param, @Res() res: Response): Promise<void> {
        try {
            await this.gameCardService.deleteGameCard(param.gameCardId);
            await this.gameManagerService.deleteGame(param.gameCardId);
            res.status(HttpStatus.NO_CONTENT);
        } catch {
            throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/')
    async createGame(@Body() game: GameCardDto, @Res() res: Response): Promise<void> {
        try {
            if (Object.keys(game).length) {
                const newGame = await this.gameCardService.createGameCard(game);
                this.gameManagerService.createGame(game._id);
                res.status(HttpStatus.CREATED).send(newGame);
            } else res.sendStatus(HttpStatus.BAD_REQUEST);
        } catch (err) {
            throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/image/:radius')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'file', maxCount: 2 }], { storage }))
    async uploadImages(@UploadedFiles() files, @Param() param, @Res() res: Response): Promise<void> {
        files = files.file;
        try {
            if (Object.keys(files).length) {
                const differencesArray = await this.differenceService.compareImages(files[0].path, files[1].path, param.radius);
                if (this.gameDifficultyService.isGameValid(differencesArray)) {
                    const differenceObjectId = await this.differenceClickService.createDifferenceArray(differencesArray);
                    const difficulty = this.gameDifficultyService.setGameDifficulty(differencesArray);

                    const data: ServerGeneratedGameInfo = {
                        gameId: differenceObjectId,
                        originalImageName: files[0].filename,
                        differenceImageName: files[1].filename,
                        gameDifficulty: difficulty,
                        gameDifferenceNumber: differencesArray.length,
                    };
                    res.status(HttpStatus.CREATED).send(data);
                } else {
                    this.imageManagerService.deleteImage(files[0].filename);
                    this.imageManagerService.deleteImage(files[1].filename);
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
}
