import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Controller, Get, Patch, Query } from '@nestjs/common';

@Controller('game-click')
export class GameClickController {
    constructor(private differenceClickService: DifferenceClickService) {}

    @Get()
    getDifference(@Query('x') clickPositionX: string, @Query('y') clickPositionY: string, @Query('id') stageId: string): ClickDifferenceVerification {
        return this.differenceClickService.validateDifferencePositions(clickPositionX, clickPositionY, stageId);
    }

    @Patch()
    resetDifference(): void {
        this.differenceClickService.resetDifferences();
    }
}
