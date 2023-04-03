/* eslint-disable no-underscore-dangle */ // need it because the id_ attribute from MongoDb
import { GameCard, GameCardDocument } from '@app/schemas/game-cards.schemas';
import { BestTimesService } from '@app/services/best-times/best-times.service';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { GameCardDto } from '@common/game-card.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

@Injectable()
export class GameCardService {
    // we need 3 services and one model for this service
    // eslint-disable-next-line max-params
    constructor(
        @InjectModel(GameCard.name) private gameCardModel: Model<GameCardDocument>,
        private imageManagerService: ImageManagerService,
        private bestTimesService: BestTimesService, // private gameManagerService: GameManagerService,
    ) {}

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
        const deletedGameCard = await this.gameCardModel.findByIdAndDelete(new ObjectId(id));
        this.imageManagerService.deleteImage(deletedGameCard.originalImageName);
        this.imageManagerService.deleteImage(deletedGameCard.differenceImageName);
    }

    // async deleteAllGameCards(): Promise<void> {
    //     const allGameCards = await this.gameCardModel.find({});
    //     allGameCards.forEach(async (gameCard) => {
    //         await this.deleteGameCard(gameCard._id);
    //         await this.gameManagerService.deleteGameFromDb(gameCard._id.toString());
    //     });
    // }

    generateGameCard(game: GameCardDto): GameCard {
        return {
            _id: new ObjectId(game._id),
            name: game.name,
            difficulty: game.difficulty,
            differenceNumber: game.differenceNumber,
            originalImageName: game.baseImage,
            differenceImageName: game.differenceImage,
            soloTimes: this.bestTimesService.generateBestTimes(),
            multiTimes: this.bestTimesService.generateBestTimes(),
        };
    }
}
