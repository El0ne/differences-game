import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Controller, Get, HttpStatus, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('game-click')
export class GameClickController {
    constructor(private differenceClickService: DifferenceClickService) {}

    @Get('/')
    validateDifference(@Query('x') clickPositionX: number, @Query('y') clickPositionY: number, @Query('id') id: string): ClickDifferenceVerification {
        return this.differenceClickService.validateDifferencePositions(clickPositionX, clickPositionY, id);
    }

    @Get('/diff')
    async getDifferences(@Res() res: Response) {
        const gameCards = await this.differenceClickService.getAllDifferenceArrays();
        console.log('gameCards', gameCards);
        res.status(HttpStatus.OK).send(gameCards);
        // return this.differenceClickService.getAllDifferenceArrays();
    }
    @Get(':id')
    getDifferencesFromId(@Param('id') stageId: string): number[][] {
        return this.differenceClickService.getDifferenceArrayFromStageID(stageId);
    }
}
