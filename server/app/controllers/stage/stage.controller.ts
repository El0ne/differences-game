import { GAMES } from '@app/dataBase/stages';
import { Controller, Get } from '@nestjs/common';

@Controller('stage')
export class StageController {
    @Get('info')
    getNbOfStages() {
        return GAMES.length;
    }
}
