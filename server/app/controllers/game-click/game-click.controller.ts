import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('game-click')
export class GameClickController {
    constructor(private differenceClickService: DifferenceClickService) {}
    @Get('/')
    getDifference(@Param('stageId') stageId: number, @Param('position') clickPosition: number): number[] {
        return this.differenceClickService.getDifferencePositions(stageId, clickPosition);
    }
}
