import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Controller, Get, Param, Patch } from '@nestjs/common';

@Controller('game-click')
export class GameClickController {
    constructor(private differenceClickService: DifferenceClickService) {}

    @Get()
    getDifference(@Param('position') clickPosition: number[], @Param('id') stageId: number): ClickDifferenceVerification {
        return this.differenceClickService.validateDifferencePositions(clickPosition, stageId);
    }

    @Patch()
    resetDifference(): void {
        this.differenceClickService.resetDifferences();
    }
}
