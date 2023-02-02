import { GAMES } from '@app/dataBase/stages';
import { GameCardInformation } from '@common/game-card';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameCardService {
    getGameCards(startIndex: number, endIndex: number): GameCardInformation[] {
        return GAMES.slice(startIndex, endIndex);
    }
}
