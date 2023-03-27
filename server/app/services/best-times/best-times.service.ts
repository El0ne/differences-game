// using _id property
/* eslint-disable no-underscore-dangle */

import { GameCard, GameCardDocument } from '@app/schemas/game-cards.schemas';
import { GameCardInformation } from '@common/game-card';
import { RankingBoard } from '@common/ranking-board';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

const MAX_GENERATED_TIME = 200;
const GENERATED_NAME_LENGTH = 10;

@Injectable()
export class BestTimesService {
    constructor(@InjectModel(GameCard.name) private gameCardModel: Model<GameCardDocument>) {}
    async resetAllGameCards(): Promise<void> {
        const test = await this.gameCardModel.find({});
        test.forEach(async (gameCard) => {
            await this.resetGameCard(gameCard._id);
        });
    }

    async resetGameCard(_id: string): Promise<void> {
        await this.gameCardModel.updateOne(
            { _id: new ObjectId(_id) },
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

    updateBestTimes(gameCardInfo: GameCardInformation, winnerBoard: RankingBoard, isMultiplayer: boolean): GameCardInformation {
        if (!isMultiplayer) {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < gameCardInfo.soloTimes.length; i++) {
                if (winnerBoard.time < gameCardInfo.soloTimes[i].time) {
                    // gameCardInfo.soloTimes[i + 2].name = gameCardInfo.soloTimes[i + 1].name;
                    // gameCardInfo.soloTimes[i + 1].name = gameCardInfo.soloTimes[i].name;
                    gameCardInfo.soloTimes[i].name = winnerBoard.name;

                    // gameCardInfo.soloTimes[i + 2].time = gameCardInfo.soloTimes[i + 1].time;
                    // gameCardInfo.soloTimes[i + 1].time = gameCardInfo.soloTimes[i].time;
                    gameCardInfo.soloTimes[i].time = winnerBoard.time;
                }
            }
        } else {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < gameCardInfo.multiTimes.length; i++) {
                if (winnerBoard.time < gameCardInfo.multiTimes[i].time) {
                    // gameCardInfo.multiTimes[i + 2].name = gameCardInfo.multiTimes[i + 1].name;
                    // gameCardInfo.multiTimes[i + 1].name = gameCardInfo.multiTimes[i].name;
                    gameCardInfo.multiTimes[i].name = winnerBoard.name;

                    // gameCardInfo.multiTimes[i + 2].time = gameCardInfo.multiTimes[i + 1].time;
                    // gameCardInfo.multiTimes[i + 1].time = gameCardInfo.multiTimes[i].time;
                    gameCardInfo.multiTimes[i].time = winnerBoard.time;
                }
            }
        }
        return gameCardInfo;
    }
}
