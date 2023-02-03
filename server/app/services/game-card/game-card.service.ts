import { GameCardInformation } from '@common/game-card';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class GameCardService {
    jsonPath = path.join(process.cwd(), '/app/dataBase/game-cards-informations.json');
    content = fs.readFileSync(this.jsonPath, 'utf8');

    getGameCards(startIndex: number, endIndex: number): GameCardInformation[] {
        return JSON.parse(this.content).gameCardsInformations.slice(startIndex, endIndex);
    }
    getGameCardsNumber(): number {
        return JSON.parse(this.content).gameCardsInformations.length;
    }
}
