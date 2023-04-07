import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { Controller, Delete, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('image')
export class ImageController {
    constructor(private imageManagerService: ImageManagerService) {}
    @Get('')
    async getImageNames(@Query('id') id: string, @Res() res: Response): Promise<void> {
        try {
            const image = await this.imageManagerService.getImageObjectById(id);
            res.status(HttpStatus.OK).send(image);
        } catch (err) {
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Get('/:imageName')
    async getImage(@Param() param, @Res() res: Response): Promise<void> {
        try {
            const imagePath = join(process.cwd(), `assets/images/${param.imageName}`);
            res.status(HttpStatus.OK).sendFile(imagePath);
        } catch (err) {
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete('/:id')
    async deleteImageObjects(@Param() param, @Res() res: Response): Promise<void> {
        try {
            this.imageManagerService.deleteImageObject(param.id);
            res.status(HttpStatus.NO_CONTENT).send([]);
        } catch (err) {
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
