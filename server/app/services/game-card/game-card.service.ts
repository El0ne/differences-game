import { GameCardInformation } from '@common/game-card';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class GameCardService {
    async getGameCards(startIndex: number, endIndex: number): Promise<GameCardInformation[]> {
        const dataPath = path.join(process.cwd(), '/app/dataBase/game-cards-informations.json');
        // const test = await fs.readFile(dataPath, 'utf-8', (error, data) => {
        //     if (error) {
        //         console.log(error);
        //         return;
        //     }
        //     console.log('data', data);
        //     return JSON.parse(data);
        // });
        // console.log('test', test);
        const content = fs.readFileSync(dataPath, 'utf8');
        console.log(JSON.parse(content).gameCardsInformations.slice(startIndex, endIndex));
        return JSON.parse(content).gameCardsInformations.slice(startIndex, endIndex);
    }
}
