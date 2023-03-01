import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import * as path from 'path';
import { Differences, DifferencesDocument } from 'schemas/differences.schemas';
@Injectable()
export class DifferenceClickService {
    jsonPath = path.join(process.cwd(), 'app/dataBase/differences.json');
    constructor(
        @InjectModel(Differences.name) private differenceModel: Model<DifferencesDocument>,
        private differenceCounterService: DifferencesCounterService,
        private imageDimensionsService: ImageDimensionsService,
    ) {}

    // getAllDifferenceArrays(): DifferencesObject[] {
    //     // const content = fs.readFileSync(this.jsonPath, 'utf8');
    //     // return JSON.parse(content).differenceObjects;
    // }

    async getAllDifferenceArrays(): Promise<Differences[]> {
        return await this.differenceModel.find({});
    }

    async createDifferenceArray(gameId: string, differencesArray: number[][]): Promise<Differences> {
        // const allDifferenceArrays = this.getAllDifferenceArrays();
        // allDifferenceArrays.push(newDifferenceArray);
        // fs.writeFileSync(this.jsonPath, JSON.stringify({ differenceObjects: allDifferenceArrays }));
        // return newDifferenceArray;
        const newDifferenceArray: Differences = {
            id: gameId,
            differences: differencesArray,
        };
        const differences = new this.differenceModel(newDifferenceArray);
        return differences.save();
    }

    getDifferenceArrayFromStageID(stageId: string): number[][] {
        const content = fs.readFileSync(this.jsonPath, 'utf8');
        for (const differenceObject of JSON.parse(content).differenceObjects) {
            if (differenceObject.id === stageId) {
                return differenceObject.differences;
            }
        }
        return [];
    }

    validateDifferencePositions(clickPositionX: number, clickPositionY: number, stageId: string): ClickDifferenceVerification {
        const differences = this.getDifferenceArrayFromStageID(stageId);
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
