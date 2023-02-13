import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { DifferencesObject } from '@common/differences-object';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class DifferenceClickService {
    jsonPath = path.join(process.cwd(), 'app/dataBase/differences.json');
    constructor(private differenceCounterService: DifferencesCounterService, private imageDimensionsService: ImageDimensionsService) {}

    getAllDifferenceArrays(): DifferencesObject[] {
        const content = fs.readFileSync(this.jsonPath, 'utf8');
        return JSON.parse(content).differenceObjects;
    }
    createDifferenceArray(gameId: string, differencesArray: number[][]): DifferencesObject {
        const allDifferenceArrays = this.getAllDifferenceArrays();
        const newDifferenceArray: DifferencesObject = {
            id: gameId,
            differences: differencesArray,
        };
        allDifferenceArrays.push(newDifferenceArray);
        fs.writeFileSync(this.jsonPath, JSON.stringify({ differenceObjects: allDifferenceArrays }));
        return newDifferenceArray;
    }

    getDifferenceArrayFromStageID(stageId: string): number[][] {
        // console.log('this content', this.content);
        const content = fs.readFileSync(this.jsonPath, 'utf8');

        for (const differenceObject of JSON.parse(content).differenceObjects) {
            if (differenceObject.id === stageId) {
                return differenceObject.differences;
            }
        }
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
