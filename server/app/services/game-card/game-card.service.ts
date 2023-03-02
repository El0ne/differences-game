import { GameCard, GameCardDocument } from '@app/schemas/game-cards.schemas';
import { GameCardDto } from '@common/game-card.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

@Injectable()
export class GameCardService {
    constructor(@InjectModel(GameCard.name) private gameCardModel: Model<GameCardDocument>) {}

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
        return await this.gameCardModel.findById(new ObjectId(id));
    }

    async getGameCardsNumber(): Promise<number> {
        return await this.gameCardModel.count();
    }

    async createGameCard(gameCard: GameCardDto): Promise<GameCard> {
        const generatedGameCard = this.generateGameCard(gameCard);
        const newGameCard = new this.gameCardModel(generatedGameCard);
        return newGameCard.save();
    }

    async deleteGameCard(id: string): Promise<void> {
        await this.gameCardModel.findByIdAndDelete(new ObjectId(id));
        if ((await this.getGameCardsNumber()) === 0) {
            await this.populateDB();
        }
    }

    generateGameCard(game: GameCardDto): GameCard {
        return {
            // eslint-disable-next-line no-underscore-dangle
            _id: new ObjectId(game._id),
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

    async populateDB() {
        for (let i = 0; i < 6; i++) {
            this.createGameCard(getFakeGameDTO());
        }
    }
}

const getFakeGameDTO = (): GameCardDto => ({
    _id: new ObjectId().toHexString(),
    name: (Math.random() + 1).toString(36).substring(2),
    difficulty: 'Facile',
    baseImage: 'game.baseImage',
    differenceImage: 'game.differenceImage',
    radius: 3,
    differenceNumber: 6,
});
