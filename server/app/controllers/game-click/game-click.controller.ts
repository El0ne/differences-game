import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Controller, Get, Patch, Query } from '@nestjs/common';

@Controller('game-click')
export class GameClickController {
    constructor(private differenceClickService: DifferenceClickService) {}

    @Get('/')
    getDifference(
        @Query('x') clickPositionX: number,
        @Query('y') clickPositionY: number,
        @Query('id') stageId: number,
        @Query('radius') radius: number,
    ): ClickDifferenceVerification {
        return this.differenceClickService.validateDifferencePositions(clickPositionX, clickPositionY, stageId, radius);
    }

    @Patch('/')
    resetDifference(): void {
        this.differenceClickService.resetDifferences();
    }
}
