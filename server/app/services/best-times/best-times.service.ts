import { GameCard, GameCardDocument } from '@app/schemas/game-cards.schemas';
import { RankingBoard } from '@common/ranking-board';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

const MAX_GENERATED_TIME = 200;
const GENERATED_NAME_LENGTH = 10;

@Injectable()
export class BestTimesService {
    constructor(@InjectModel(GameCard.name) private gameCardModel: Model<GameCardDocument>) {}
    async resetAllGameCards(): Promise<void> {
        const test = await this.gameCardModel.find({});
        test.forEach(async (gameCard) => {
            await this.resetGameCard(gameCard);
        });
    }

    async resetGameCard(gameCard: GameCard): Promise<void> {
        await this.gameCardModel.updateOne(
            // using _id property
            // eslint-disable-next-line no-underscore-dangle
            { _id: gameCard._id },
            { $set: { soloTimes: this.generateBestTimes(), multiTimes: this.generateBestTimes() } },
        );
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
        return {
            time: Math.floor(Math.random() * MAX_GENERATED_TIME),
            name: this.generateRandomName(),
        };
    }

    generateRandomName() {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        let word = '';

        for (let i = 0; i < GENERATED_NAME_LENGTH; i++) {
            const index = Math.floor(Math.random() * alphabet.length);
            word += alphabet[index];
        }
        return word;
    }
}
