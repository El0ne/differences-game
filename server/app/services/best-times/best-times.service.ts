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
        const resultBoardSolo = gameCardInfo.soloTimes;
        resultBoardSolo.push(winnerBoard);

        const resultBoardMultiplayer = gameCardInfo.multiTimes;
        resultBoardMultiplayer.push(winnerBoard);

        const sortedBoardSolo = resultBoardSolo.sort((a, b) => (a.time < b.time ? -1 : 1));
        const newResultBoardSolo = sortedBoardSolo.slice(0, 3);

        const sortedBoardMultiplayer = resultBoardMultiplayer.sort((a, b) => (a.time < b.time ? -1 : 1));
        const newResultBoardMultiplayer = sortedBoardMultiplayer.slice(0, 3);

        if (!isMultiplayer) {
            for (let k = 0; k < 3; k++) {
                gameCardInfo.soloTimes[k].name = newResultBoardSolo[k].name;
                gameCardInfo.soloTimes[k].time = newResultBoardSolo[k].time;
            }
            gameCardInfo.soloTimes.pop();
        } else {
            for (let k = 0; k < 3; k++) {
                gameCardInfo.multiTimes[k].name = newResultBoardMultiplayer[k].name;
                gameCardInfo.multiTimes[k].time = newResultBoardMultiplayer[k].time;
            }
            gameCardInfo.multiTimes.pop();
        }
        return gameCardInfo;
    }
}
