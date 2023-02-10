import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { Controller, Get, Param, Patch } from '@nestjs/common';

@Controller('game-click')
export class GameClickController {
    constructor(private differenceClickService: DifferenceClickService) {}

    @Get()
    getDifference(@Param('position') clickPosition: number[], @Param('id') stageId: number): boolean {
        return this.differenceClickService.validateDifferencePositions(clickPosition);
    }

    @Patch()
    resetDifference(): void {
        this.differenceClickService.resetDifferences();
    }
}
