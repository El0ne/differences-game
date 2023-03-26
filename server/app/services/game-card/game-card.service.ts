/* eslint-disable no-underscore-dangle */ // need it because the id_ attribute from MongoDb
import { GameCard, GameCardDocument } from '@app/schemas/game-cards.schemas';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { GameCardDto } from '@common/game-card.dto';
import { RankingBoard } from '@common/ranking-board';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

@Injectable()
export class GameCardService {
    constructor(@InjectModel(GameCard.name) private gameCardModel: Model<GameCardDocument>, private imageManagerService: ImageManagerService) {}

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

    async resetAllGameCards(): Promise<void> {
        console.log('first');
        const test = await (
            await this.gameCardModel.find({})
        ).forEach(async (gameCard) => {
            await this.gameCardModel.updateOne(
                { _id: gameCard._id },
                { $set: { soloTimes: this.generateBestTimes(), multiTimes: this.generateBestTimes() } },
            );
        });
        console.log('first');
    }

    generateGameCard(game: GameCardDto): GameCard {
        return {
            _id: new ObjectId(game._id),
            name: game.name,
            difficulty: game.difficulty,
            differenceNumber: game.differenceNumber,
            originalImageName: game.baseImage,
            differenceImageName: game.differenceImage,
            soloTimes: this.generateBestTimes(),
            multiTimes: this.generateBestTimes(),
        };
    }

    generateBestTimes(): RankingBoard[] {
        const bestScores = [];
        for (let i = 0; i < 3; i++) {
            bestScores.push(this.generateBestTime());
        }

        bestScores.sort((a: RankingBoard, b: RankingBoard) => {
            return a.time - b.time;
        });

        return bestScores;
    }

    generateBestTime(): RankingBoard {
        const maxGameTime = 200;
        return {
            time: Math.floor(Math.random() * maxGameTime),
            name: this.generateRandomName(),
        };
    }

    generateRandomName() {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        let word = '';

        const nameLength = 10;
        for (let i = 0; i < nameLength; i++) {
            const index = Math.floor(Math.random() * alphabet.length);
            word += alphabet[index];
        }
        return word;
    }
}
