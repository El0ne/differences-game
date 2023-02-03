import { GameCardInformation } from '@common/game-card';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class GameCardService {
    jsonPath = path.join(process.cwd(), '/app/dataBase/game-cards-informations.json');
    getGameCards(startIndex: number, endIndex: number): GameCardInformation[] {
        const content = fs.readFileSync(this.jsonPath, 'utf8');
        return JSON.parse(content).gameCardsInformations.slice(startIndex, endIndex);
    }
    getGameCardsNumber(): number {
        const content = fs.readFileSync(this.jsonPath, 'utf8');
        return JSON.parse(content).gameCardsInformations.length;
    }
}
