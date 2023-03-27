import { BestTime, BestTimeDocument } from '@app/schemas/best-times.schemas';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

@Injectable()
export class BestTimeService {
    constructor(@InjectModel(BestTime.name) private bestTimeModel: Model<BestTimeDocument>, private gameCardService: GameCardService) {}

    async getAllBestTimesCards(): Promise<BestTime[]> {
        return await this.bestTimeModel.find({});
    }

    async getBestTimes(startIndex: number, endIndex: number): Promise<BestTime[]> {
        return await this.bestTimeModel
            .find({})
            .skip(startIndex)
            .limit(endIndex - startIndex + 1);
    }

    async getBestTimeById(id: string): Promise<BestTime> {
        return await this.bestTimeModel.findById(new ObjectId(id));
    }

    generateUserBestTime(newBestTime: BestTime): RankingBoard {
        return {
            time: newBestTime.time,
            name: newBestTime.name,
        };
    }
}
