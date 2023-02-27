import { DataBaseService } from '@app/services/data-base/data-base.service';
import { GameCardInformation } from '@common/game-card';
import { GameInformation } from '@common/game-information';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GameCardService {
    jsonPath = path.join(process.cwd(), '/app/dataBase/game-cards-informations.json');
    constructor(private dataBaseService: DataBaseService) {}

    get collection() {
        return this.dataBaseService.db.collection('gameCards');
    }

    async getAllGameCards() {
        return await this.collection.find({}).toArray();
    }

    /*
    getAllGameCards(): GameCardInformation[] {
        const content = fs.readFileSync(this.jsonPath, 'utf8');
        return JSON.parse(content).gameCardsInformations;
    }
    */

    async getGameCards(startIndex: number, endIndex: number) {
        // return this.getAllGameCards().slice(startIndex, endIndex);
        const allGameCards = await this.getAllGameCards();
        return allGameCards;
    }

    async getGameCardById(id: string) {
        const allGameCards = await this.getAllGameCards();
        return allGameCards.find((game) => game.id === id);
    }

    getGameCardsNumber(): number {
        const content = fs.readFileSync(this.jsonPath, 'utf8');
        return JSON.parse(content).gameCardsInformations.length;
    }

    // createGameCard(game): GameCardInformation {
    //     const allGameCards = this.getAllGameCards();
    //     const newGame = this.generateGameCard(game);
    //     allGameCards.push(newGame);
    //     fs.writeFileSync(this.jsonPath, JSON.stringify({ gameCardsInformations: allGameCards }));
    //     return newGame;
    // }

    generateGameCard(game: GameInformation): GameCardInformation {
        return {
            id: game.id,
            name: game.name,
            difficulty: game.difficulty,
            differenceNumber: game.differenceNumber,
            originalImageName: game.baseImage,
            differenceImageName: game.differenceImage,
            soloTimes: [
                { time: 0, name: '--' },
                { time: 0, name: '--' },
                { time: 0, name: '--' },
            ],
            multiTimes: [
                { time: 0, name: '--' },
                { time: 0, name: '--' },
                { time: 0, name: '--' },
            ],
        };
    }
}
