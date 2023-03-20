import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Controller, Delete, Get, Param, Query } from '@nestjs/common';

@Controller('game-click')
export class GameClickController {
    constructor(private differenceClickService: DifferenceClickService) {}

    @Get('/')
    async validateDifference(
        @Query('x') clickPositionX: number,
        @Query('y') clickPositionY: number,
        @Query('id') id: string,
    ): Promise<ClickDifferenceVerification> {
        return await this.differenceClickService.validateDifferencePositions(clickPositionX, clickPositionY, id);
    }

    @Get(':id')
    async getDifferencesFromId(@Param('id') stageId: string): Promise<number[][]> {
        return await this.differenceClickService.getDifferenceArrayFromStageID(stageId);
    }

    @Delete(':id')
    async deleteDifferences(@Param('id') id: string): Promise<void> {
        return await this.differenceClickService.deleteDifferences(id);
    }
}
