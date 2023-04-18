import { GameConstants } from '@common/game-constants';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class GameConstantService {
    readonly jsonPath = 'assets/dataBase/game-constants.json';

    getGameConstants(): GameConstants {
        const content = fs.readFileSync(this.jsonPath, 'utf8');
        return JSON.parse(content);
    }

    updateGameConstants(gameConstants: GameConstants) {
        fs.writeFileSync(this.jsonPath, JSON.stringify(gameConstants));
    }
}
