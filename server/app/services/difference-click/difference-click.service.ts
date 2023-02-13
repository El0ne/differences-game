import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { DifferencesObject } from '@common/differences-object';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { WIDTH } from './image-constants';
@Injectable()
export class DifferenceClickService {
    jsonPath = path.join(process.cwd(), 'app/dataBase/differences.json');
    content = fs.readFileSync(this.jsonPath, 'utf8');
    constructor(private differenceCounterService: DifferencesCounterService) {}

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
        for (const differenceObject of JSON.parse(this.content).differences) {
            if (differenceObject.id === stageId) {
                return differenceObject.differences;
            }
        }
    }

    setDifference(stageId: string) {
        const differences = this.getDifferenceArrayFromStageID(stageId);
        return differences;
    }

    validateDifferencePositions(clickPositionX: number, clickPositionY: number, stageId: string): ClickDifferenceVerification {
        const differences = this.getDifferenceArrayFromStageID(stageId);
        const x = Number(clickPositionX);
        const y = Number(clickPositionY);
        const posToCheck = y * WIDTH + x;
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
        /*
        for (const difference of this.unchangedDifferences) {
            for (const positions of difference) {
                if (positions === posToCheck) {
                    const index = this.differences.indexOf(difference);
                    const currentDifference = difference;
                    this.differences.splice(index, 1);
                    // console.log(this.unchangedDifferences.splice(index, 1)); // TODO : Faut laisser ca sinon ca bug
                    return {
                        isADifference: true,
                        differenceArray: currentDifference,
                        remainingDifferences: differences,
                    };
                }
            }
        }
        return {
            isADifference: false,
            differenceArray: [],
            remainingDifferences: differences,
        };
        */
    }
}
