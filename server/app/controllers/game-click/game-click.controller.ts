import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Controller, Get, Param, Patch, Query } from '@nestjs/common';

@Controller('game-click')
export class GameClickController {
    constructor(private differenceClickService: DifferenceClickService) {}

    @Get('/')
    validateDifference(@Query('x') clickPositionX: number, @Query('y') clickPositionY: number): ClickDifferenceVerification {
        return this.differenceClickService.validateDifferencePositions(clickPositionX, clickPositionY);
    }

    @Get(':id')
    getDifferencesFromId(@Query('radius') radius: number, @Param('id') stageId: number): number[][] {
        return this.differenceClickService.setDifference(stageId, radius);
    }

    @Patch('/')
    resetDifference(): void {
        this.differenceClickService.resetDifferences();
    }
}
