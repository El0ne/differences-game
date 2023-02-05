import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameCardInformation } from '@common/game-card';
import { ImageInformation } from '@common/image-information';
import { Body, Controller, Get, Param, Post, Query, StreamableFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// based on https://www.youtube.com/watch?v=f-URVd2OKYc
export const storage = diskStorage({
    destination: './assets/images',
    filename: (req, file, cb) => {
        const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
        const extension: string = path.parse(file.originalname).ext;
        cb(null, `${filename}${extension}`);
    },
});

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
        return this.gameCardService.createGameCard(game);
    }

    @Post('/image')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'baseImage', maxCount: 1 },
                { name: 'differenceImage', maxCount: 1 },
            ],
            { storage },
        ),
    )
    uploadImages(@UploadedFiles() files): ImageInformation[] {
        // TODO ajouter appel au service qui va générer les images de différences
        return [files.baseImage[0], files.differenceImage[0]];
    }

    @Get('/image/:imageName')
    getImage(@Param() param): StreamableFile {
        console.log(param.imageName);
        const imagePath = join(process.cwd(), 'assets/images');
        const file = createReadStream(join(imagePath, `/${param.imageName}`));
        console.log('file', file.path);
        return new StreamableFile(file);
    }

    @Get('/image')
    getFile(): StreamableFile {
        const file = createReadStream(join(process.cwd(), 'assets/images/test.bmp'));
        console.log('file', file);

        return new StreamableFile(file);
    }
}
