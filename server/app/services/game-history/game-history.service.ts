import { GameHistory, GameHistoryDocument } from '@app/schemas/game-history';
import { GameHistoryDTO } from '@common/game-history.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameHistoryService {
    constructor(@InjectModel(GameHistory.name) private gameCardModel: Model<GameHistoryDocument>) {}

    async getGameHistory(): Promise<GameHistoryDTO[]> {
        return await this.gameCardModel.find({});
    }

    async addGameToHistory(gameHistory: GameHistoryDTO): Promise<GameHistory> {
        const newGameHistory = new this.gameCardModel(gameHistory);
        return newGameHistory.save();
    }

    async deleteAllGameHistory(): Promise<void> {
        await this.gameCardModel.deleteMany({});
    }
}
