import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { WIDTH } from './image-constants';

@Injectable()
export class DifferenceClickService {
    jsonPath = path.join(process.cwd(), 'app/dataBase/differences.json');
    content = fs.readFileSync(this.jsonPath, 'utf8');
    private differences: number[][];
    private unchangedDifferences: number[][];
    private id: number;
    constructor() {
        this.id = 0;
        this.unchangedDifferences = [];
        this.differences = [];
    }

    resetDifferences() {
        this.differences = this.unchangedDifferences;
    }

    copyDifferencesToUnchanged(originalArray: number[][]) {
        for (const element of originalArray) {
            this.unchangedDifferences.push(element);
        }
    }

    getDifferenceArrayFromStageID(stageId: number): number[][] {
        for (const differenceObject of JSON.parse(this.content).differences) {
            if (differenceObject.id.toString() === stageId) {
                return differenceObject.differences;
            }
        }
    }

    setDifference(stageId: number) {
        this.differences = this.getDifferenceArrayFromStageID(stageId);
        this.copyDifferencesToUnchanged(this.differences);
        this.id = +stageId;
        return this.differences;
    }

    validateDifferencePositions(clickPositionX: number, clickPositionY: number): ClickDifferenceVerification {
        const x: number = +clickPositionX;
        const y: number = +clickPositionY;
        const posToCheck = y * WIDTH + x;
        for (const difference of this.unchangedDifferences) {
            for (const positions of difference) {
                if (positions === posToCheck) {
                    const index = this.unchangedDifferences.indexOf(difference);
                    const currentDifference = difference;
                    this.unchangedDifferences.splice(index, 1);
                    return {
                        isADifference: true,
                        differenceArray: currentDifference,
                        remainingDifferences: this.differences,
                    };
                }
            }
        }
        return {
            isADifference: false,
            differenceArray: [],
            remainingDifferences: this.differences,
        };
    }
}
