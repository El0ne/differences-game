import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Differences, DifferencesDocument } from 'schemas/differences.schemas';

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

    // TODO type the return value of funcion
    async createDifferenceArray(differencesArray: number[][]): Promise<string> {
        const newDifferenceArray: Differences = {
            differences: differencesArray,
        };
        const differences = new this.differenceModel(newDifferenceArray);
        console.log('typeof differences', typeof differences);
        // eslint-disable-next-line no-underscore-dangle
        return (await differences.save())._id;
    }

    async getDifferenceArrayFromStageID(_id: string): Promise<number[][]> {
        // TODO return object and not only differences
        const differenceArray = await this.differenceModel.findOne({ _id });
        return differenceArray.differences;
    }

    async validateDifferencePositions(clickPositionX: number, clickPositionY: number, stageId: string): Promise<ClickDifferenceVerification> {
        const differences = await this.getDifferenceArrayFromStageID(stageId);
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
