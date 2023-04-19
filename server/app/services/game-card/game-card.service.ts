// need it because the id_ attribute from MongoDb
/* eslint-disable no-underscore-dangle */
import { GameCard, GameCardDocument } from '@app/schemas/game-cards.schemas';
import { BestTimesService } from '@app/services/best-times/best-times.service';
import { GameCardDto } from '@common/game-card.dto';
import { RankingBoard } from '@common/ranking-board';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

@Injectable()
export class GameCardService {
    constructor(@InjectModel(GameCard.name) private gameCardModel: Model<GameCardDocument>, private bestTimesService: BestTimesService) {}

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
    }

    generateGameCard(game: GameCardDto): GameCard {
        return {
            _id: new ObjectId(game._id),
            name: game.name,
            difficulty: game.difficulty,
            differenceNumber: game.differenceNumber,
            soloTimes: this.bestTimesService.generateBestTimes(),
            multiTimes: this.bestTimesService.generateBestTimes(),
        };
    }

    async updateGameCard(game: GameCard, winnerBoard: RankingBoard, isMultiplayer: boolean): Promise<GameCard> {
        if (isMultiplayer) {
            game.multiTimes = this.bestTimesService.updateBestTimes(game.multiTimes, winnerBoard);
        } else {
            game.soloTimes = this.bestTimesService.updateBestTimes(game.soloTimes, winnerBoard);
        }
        await this.gameCardModel.findOneAndUpdate({ _id: game._id }, game);
        return game;
    }
}
