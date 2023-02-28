import { DataBaseService } from '@app/services/data-base/data-base.service';
import { Injectable } from '@nestjs/common';
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

    // async getGameCards(startIndex: number, endIndex: number): Promise<unknown> {
    //     const allGameCards = await this.getAllGameCards();
    //     const selectedGameCards: GameCardInformation[] = [];
    //     for (let i = startIndex; i <= endIndex; i++) {
    //         selectedGameCards.push(allGameCards[i]);
    //     }
    //     return selectedGameCards;
    // }

    // async getGameCardById(id: string): Promise<Document> {
    //     const allGameCards = await this.getAllGameCards();
    //     return allGameCards.find((game) => game.id === id);
    // }

    // async getGameCardsNumber(): Promise<number> {
    //     const allGameCards = await this.getAllGameCards();
    //     return allGameCards.length;
    // }

    // async createGameCard(game): Promise<GameCardInformation> {
    //     const newGame = this.generateGameCard(game);
    //     await this.collection.insertOne(newGame);
    //     return newGame;
    // }

    // generateGameCard(game: GameInformation): GameCardInformation {
    //     return {
    //         id: game.id,
    //         name: game.name,
    //         difficulty: game.difficulty,
    //         differenceNumber: game.differenceNumber,
    //         originalImageName: game.baseImage,
    //         differenceImageName: game.differenceImage,
    //         soloTimes: [
    //             { time: 0, name: '--' },
    //             { time: 0, name: '--' },
    //             { time: 0, name: '--' },
    //         ],
    //         multiTimes: [
    //             { time: 0, name: '--' },
    //             { time: 0, name: '--' },
    //             { time: 0, name: '--' },
    //         ],
    //     };
    // }

    // async deleteGameCard(id: string): Promise<Document> {
    //     const deletedGameCard = await this.collection.findOneAndDelete({ id });
    //     if (!deletedGameCard.value) {
    //         throw new Error('Game card not found');
    //     }
    //     return deletedGameCard;
    // }
}
