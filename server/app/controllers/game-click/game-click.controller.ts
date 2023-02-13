import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Controller, Get, Param, Query } from '@nestjs/common';

@Controller('game-click')
export class GameClickController {
    constructor(private differenceClickService: DifferenceClickService) {}

    @Get('/')
    validateDifference(@Query('x') clickPositionX: number, @Query('y') clickPositionY: number, @Query('id') id: string): ClickDifferenceVerification {
        return this.differenceClickService.validateDifferencePositions(clickPositionX, clickPositionY, id);
    }

    @Get(':id')
    getDifferencesFromId(@Param('id') stageId: string): number[][] {
        return this.differenceClickService.getDifferenceArrayFromStageID(stageId);
    }
}
