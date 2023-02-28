import { GameInformation } from '@common/game-information';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { GameCard, GameCardDocument } from 'game-card/schemas/game-cards.schemas';
import { Model } from 'mongoose';
import * as path from 'path';

@Injectable()
export class GameCardService {
    jsonPath = path.join(process.cwd(), '/app/dataBase/game-cards-informations.json');
    constructor(@InjectModel(GameCard.name) private gameCardModel: Model<GameCardDocument>) {}

    // get collection() {
    //     // this.db.collection(process.env.DB_GAMECARDS_COLLECTION)
    //     return this.dataBaseService.db.collection(process.env.DB_GAMECARDS_COLLECTION);
    //     // return this.dataBaseService.db.collection('gameCards');
    // }

    async getAllGameCards(): Promise<GameCard[]> {
        return await this.gameCardModel.find({});
        // return await this.collection.find({}).toArray();
    }

    /*
    getAllGameCards(): GameCardInformation[] {
        const content = fs.readFileSync(this.jsonPath, 'utf8');
        return JSON.parse(content).gameCardsInformations;
    }
    */

    async getGameCards(startIndex: number, endIndex: number) {
        // return this.getAllGameCards().slice(startIndex, endIndex);
        // const allGameCards = await this.getAllGameCards();
        // console.log('allGameCards', allGameCards);
        // return allGameCards;
        return await this.gameCardModel
            .find({})
            .skip(startIndex)
            .limit(endIndex - startIndex);
    }

    async getGameCardById(id: string) {
        const allGameCards = await this.getAllGameCards();
        // return allGameCards.find((game) => game.id === id);
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

    async createGameCard(gameCard: GameInformation): Promise<GameCard> {
        const generatedGameCard = this.generateGameCard(gameCard);
        const newGameCard = new this.gameCardModel(generatedGameCard);
        console.log('createGameCard');
        return newGameCard.save();
    }

    generateGameCard(game: GameInformation): GameCard {
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
