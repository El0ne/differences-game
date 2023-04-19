// using _id property. Need to use underscore because of MangoDB
/* eslint-disable no-underscore-dangle */

import { GameCard, GameCardDocument } from '@app/schemas/game-cards.schemas';
import { RankingBoard } from '@common/ranking-board';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

export const TIME_MULTIPLIER = 200;
export const MINIMUM_GENERATED_TIME = 30;
export const GENERATED_NAME_LENGTH = 10;

@Injectable()
export class BestTimesService {
    constructor(@InjectModel(GameCard.name) private gameCardModel: Model<GameCardDocument>) {}
    async resetAllBestTimes(): Promise<void> {
        const allGameCards = await this.gameCardModel.find({});
        allGameCards.forEach(async (gameCard) => {
            await this.resetBestTimes(gameCard._id);
        });
    }

    async resetBestTimes(_id: string): Promise<void> {
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
            time: Math.floor(Math.random() * TIME_MULTIPLIER) + MINIMUM_GENERATED_TIME,
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

    updateBestTimes(initialRankingBoard: RankingBoard[], winnerBoard: RankingBoard): RankingBoard[] {
        const initialRankingBoardCopy = initialRankingBoard.slice();
        initialRankingBoardCopy.push(winnerBoard);
        const updatedRankingBoard = initialRankingBoardCopy.sort((a, b) => {
            return a.time - b.time;
        });
        return updatedRankingBoard.slice(0, 3);
    }
}
