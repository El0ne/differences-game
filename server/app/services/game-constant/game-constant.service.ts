import { GameConstants } from '@common/game-constants';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GameConstantService {
    jsonPath = path.join(process.cwd(), 'app/dataBase/game-constants.json');

    getGameConstants(): GameConstants {
        const content = fs.readFileSync(this.jsonPath, 'utf8');
        return JSON.parse(content);
    }

    updateGameConstants(gameConstants: GameConstants) {
        fs.writeFileSync(this.jsonPath, JSON.stringify(gameConstants));
    }
}
