import { Differences, DifferencesDocument } from '@app/schemas/differences.schemas';
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

@Injectable()
export class DifferenceClickService {
    constructor(
        @InjectModel(Differences.name) private differenceModel: Model<DifferencesDocument>,
        private differenceCounterService: DifferencesCounterService,
        private imageDimensionsService: ImageDimensionsService,
    ) {}

    async getAllDifferenceArrays(): Promise<Differences[]> {
        return await this.differenceModel.find({});
    }

    async createDifferenceArray(differencesArray: number[][]): Promise<string> {
        const newDifferenceArray: Differences = {
            differences: differencesArray,
        };
        const differences = new this.differenceModel(newDifferenceArray);
        // eslint-disable-next-line no-underscore-dangle
        return (await differences.save())._id;
    }

    async getDifferenceArrayFromStageID(_id: string): Promise<number[][]> {
        const differenceArray = await this.differenceModel.findById(_id);
        return differenceArray ? differenceArray.differences : [];
    }

    async deleteDifferences(id: string): Promise<void> {
        await this.differenceModel.findByIdAndDelete(new ObjectId(id));
    }

    async validateDifferencePositions(clickPositionX: number, clickPositionY: number, _id: string): Promise<ClickDifferenceVerification> {
        const differences = await this.getDifferenceArrayFromStageID(_id);
        const x = Number(clickPositionX);
        const y = Number(clickPositionY);
        const posToCheck = y * this.imageDimensionsService.getWidth() + x;
        const differenceIndex = this.differenceCounterService.findPixelDifferenceIndex(posToCheck, differences);
        if (differenceIndex === differences.length) {
            return {
                isADifference: false,
                differenceArray: [],
                differencesPosition: differenceIndex,
            };
        } else {
            return {
                isADifference: true,
                differenceArray: differences[differenceIndex],
                differencesPosition: differenceIndex,
            };
        }
    }
}
