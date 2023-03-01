import { GameCardDto } from '@common/game-card.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as path from 'path';
import { GameCard, GameCardDocument } from 'schemas/game-cards.schemas';

@Injectable()
export class GameCardService {
    jsonPath = path.join(process.cwd(), '/app/dataBase/game-cards-informations.json');
    constructor(@InjectModel(GameCard.name) private gameCardModel: Model<GameCardDocument>) {}

    // TODO remove later if useless (i think it is)
    async getAllGameCards(): Promise<GameCard[]> {
        return await this.gameCardModel.find({});
    }

    async getGameCards(startIndex: number, endIndex: number): Promise<GameCard[]> {
        return await this.gameCardModel
            .find({})
            .skip(startIndex)
            .limit(endIndex - startIndex + 1);
    }

    async getGameCardById(id: string): Promise<GameCard> {
        return await this.gameCardModel.findOne({ id });
    }

    async getGameCardsNumber(): Promise<number> {
        return await this.gameCardModel.count();
    }

    async createGameCard(gameCard: GameCardDto): Promise<GameCard> {
        const generatedGameCard = this.generateGameCard(gameCard);
        const newGameCard = new this.gameCardModel(generatedGameCard);
        return newGameCard.save();
    }

    generateGameCard(game: GameCardDto): GameCard {
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
