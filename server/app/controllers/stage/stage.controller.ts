import { GAMES } from '@app/dataBase/stages';
import { GameCardInformation } from '@common/game-card';
import { Controller, Get } from '@nestjs/common';

@Controller('stage')
export class StageController {
    @Get()
    test(): GameCardInformation[] {
        return GAMES;
    }
    @Get('info')
    getNbOfStages(): number {
        return GAMES.length;
    }
}
