import { GameCard, GameCardDocument } from '@app/schemas/game-cards.schemas';
import { RankingBoard } from '@common/ranking-board';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BestTimesService {
    constructor(@InjectModel(GameCard.name) private gameCardModel: Model<GameCardDocument>) {}
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
