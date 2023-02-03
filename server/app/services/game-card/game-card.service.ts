import { GameCardInformation } from '@common/game-card';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class GameCardService {
    async getGameCards(startIndex: number, endIndex: number): Promise<GameCardInformation[]> {
        const dataPath = path.join(process.cwd(), '/app/dataBase/game-cards-informations.json');
        const content = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(content).gameCardsInformations.slice(startIndex, endIndex);
    }
}
