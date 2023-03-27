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
        let winnerPosition = 3;
        if (!isMultiplayer) {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < gameCardInfo.soloTimes.length; i++) {
                if (winnerBoard.time < gameCardInfo.soloTimes[i].time) {
                    winnerPosition = i;
                    break;
                }
            }
            switch (winnerPosition) {
                case 0: {
                    gameCardInfo.soloTimes[2].name = gameCardInfo.soloTimes[1].name;
                    gameCardInfo.soloTimes[1].name = gameCardInfo.soloTimes[0].name;
                    gameCardInfo.soloTimes[0].name = winnerBoard.name;

                    gameCardInfo.soloTimes[2].time = gameCardInfo.soloTimes[1].time;
                    gameCardInfo.soloTimes[1].time = gameCardInfo.soloTimes[0].time;
                    gameCardInfo.soloTimes[0].time = winnerBoard.time;

                    break;
                }
                case 1: {
                    gameCardInfo.soloTimes[2].name = gameCardInfo.soloTimes[1].name;
                    gameCardInfo.soloTimes[1].name = winnerBoard.name;

                    gameCardInfo.soloTimes[2].time = gameCardInfo.soloTimes[1].time;
                    gameCardInfo.soloTimes[1].time = winnerBoard.time;

                    break;
                }
                case 2: {
                    gameCardInfo.soloTimes[2].name = winnerBoard.name;

                    gameCardInfo.soloTimes[2].time = winnerBoard.time;

                    break;
                }
            }
        } else {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < gameCardInfo.multiTimes.length; i++) {
                if (winnerBoard.time < gameCardInfo.multiTimes[i].time) {
                    winnerPosition = i;
                    break;
                }
            }
            switch (winnerPosition) {
                case 0: {
                    gameCardInfo.multiTimes[2].name = gameCardInfo.multiTimes[1].name;
                    gameCardInfo.multiTimes[1].name = gameCardInfo.multiTimes[0].name;
                    gameCardInfo.multiTimes[0].name = winnerBoard.name;

                    gameCardInfo.multiTimes[2].time = gameCardInfo.multiTimes[1].time;
                    gameCardInfo.multiTimes[1].time = gameCardInfo.multiTimes[0].time;
                    gameCardInfo.multiTimes[0].time = winnerBoard.time;

                    break;
                }
                case 1: {
                    gameCardInfo.multiTimes[2].name = gameCardInfo.multiTimes[1].name;
                    gameCardInfo.multiTimes[1].name = winnerBoard.name;

                    gameCardInfo.multiTimes[2].time = gameCardInfo.multiTimes[1].time;
                    gameCardInfo.multiTimes[1].time = winnerBoard.time;

                    break;
                }
                case 2: {
                    gameCardInfo.multiTimes[2].name = winnerBoard.name;

                    gameCardInfo.multiTimes[2].time = winnerBoard.time;

                    break;
                }
            }
        }
        return gameCardInfo;
    }
}
