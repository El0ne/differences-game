import { GAMES } from '@app/dataBase/stages';
import { GameCardInformation } from '@common/game-card';
import { Injectable } from '@nestjs/common';
@Injectable()
export class GameCardService {
    getGameCards(startIndex: number, endIndex: number): GameCardInformation[] {
        // fs.readFile('./game-cards-informations.json', 'utf-8', (error, data) => {
        //     if (error) {
        //         console.log(error);
        //         return;
        //     }
        //     console.log(JSON.parse(data));
        // });

        return GAMES.slice(startIndex, endIndex);
        // return test.slice(startIndex, endIndex);
    }
}
