import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('image')
export class ImageController {
    // return the name of the two images
    // @Get('/:id')
    // async getImageNames(@Param() param, @Res() res: Response): Promise<void> {
    //     try {
    //         const imagePath = join(process.cwd(), `assets/images/${param.imageName}`);
    //         res.status(HttpStatus.OK).sendFile(imagePath);
    //     } catch (err) {
    //         res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }

    @Get('/:id/:imageName')
    async getImage(@Param() param, @Res() res: Response): Promise<void> {
        try {
            const imagePath = join(process.cwd(), `assets/images/${param.imageName}`);
            res.status(HttpStatus.OK).sendFile(imagePath);
        } catch (err) {
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // @Delete('/image/:imageName')
    // async deleteImage(@Param() param, @Res() res: Response): Promise<void> {
    //     try {
    //         this.imageManagerService.deleteImage(param.imageName);
    //         res.status(HttpStatus.NO_CONTENT).send([]);
    //     } catch (err) {
    //         res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    //     }
    // }
}
