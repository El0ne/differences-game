import { GameConstantService } from '@app/services/game-constant/game-constant.service';
import { GameConstants } from '@common/game-constants';
import { Body, Controller, Get, HttpException, HttpStatus, Put, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('game-constants')
export class GameConstantsController {
    constructor(private gameConstantService: GameConstantService) {}

    @Get('/')
    getGameConstants(@Res() res: Response): void {
        try {
            res.status(HttpStatus.OK).send(this.gameConstantService.getGameConstants());
        } catch {
            throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Put('/')
    updateGameConstants(@Body() gameConstants: GameConstants, @Res() res: Response): void {
        try {
            this.gameConstantService.updateGameConstants(gameConstants);
            res.status(HttpStatus.NO_CONTENT);
        } catch {
            throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
