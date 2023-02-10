import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import path from 'path';
import { TEST_ARRAY, WIDTH } from './testing-purpose-constant';

@Injectable()
export class DifferenceClickService {
    jsonPath = path.join(process.cwd(), 'app/dataBase/differences.json');
    content = fs.readFileSync(this.jsonPath, 'utf8');
    private differences: number[][];
    private unchangedDifferences: number[][];
    constructor() {
        this.unchangedDifferences = [];
        this.differences = TEST_ARRAY;
        for (const differences of this.differences) {
            this.unchangedDifferences.push(differences);
        }
    }

    resetDifferences() {
        this.differences = this.unchangedDifferences;
    }

    getDifferenceArrayFromStageID(stageId: number): number[][] {}

    validateDifferencePositions(clickPosition: number[], stageId: number): ClickDifferenceVerification {
        if (!this.differences) {
            this.differences = this.getDifferenceArrayFromStageID(stageId);
        }
        const x = clickPosition[0];
        const y = clickPosition[1];
        const posToCheck = y * WIDTH + x;
        for (const difference of this.differences) {
            for (const positions of difference) {
                if (positions === posToCheck) {
                    const index = this.differences.indexOf(difference);
                    this.differences.splice(index, 1);
                    return {
                        isADifference: true,
                        differenceArray: this.unchangedDifferences,
                        differenceNumber: this.differences.length,
                    };
                }
            }
        }
        return {
            isADifference: false,
            differenceArray: this.unchangedDifferences,
            differenceNumber: this.differences.length,
        };
    }
}
