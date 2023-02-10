import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Controller, Get, Param } from '@nestjs/common';

@Controller('game-click')
export class GameClickController {
    constructor(private differenceClickService: DifferenceClickService) {}
    @Get('/')
    getDifference(@Param('stageId') stageId: number, @Param('position') clickPosition: number): ClickDifferenceVerification {
        return this.differenceClickService.getDifferencePositions(stageId, clickPosition);
    }
}
