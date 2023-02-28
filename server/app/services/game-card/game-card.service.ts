import { GameInformation } from '@common/game-information';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { GameCard, GameCardDocument } from 'game-card/schemas/game-cards.schemas';
import { Model } from 'mongoose';
import * as path from 'path';

@Injectable()
export class GameCardService {
    jsonPath = path.join(process.cwd(), '/app/dataBase/game-cards-informations.json');
    constructor(@InjectModel(GameCard.name) private gameCardModel: Model<GameCardDocument>) {}

    // TODO remove later if useless (i think it is)
    async getAllGameCards(): Promise<GameCard[]> {
        return await this.gameCardModel.find({});
    }

    async getGameCards(startIndex: number, endIndex: number) {
        return await this.gameCardModel
            .find({})
            .skip(startIndex)
            .limit(endIndex - startIndex + 1);
    }

    async getGameCardById(id: string) {
        const allGameCards = await this.getAllGameCards();
        return this.gameCardModel.findOne({ id });
        // return allGameCards.find((game) => game.id === id);
    }

    async getGameCardsNumber(): Promise<number> {
        // const content = fs.readFileSync(this.jsonPath, 'utf8');
        // return JSON.parse(content).gameCardsInformations.length;
        return await this.gameCardModel.count();
    }

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
