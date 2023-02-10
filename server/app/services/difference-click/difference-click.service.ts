import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DifferenceClickService {
    getDifferencePositions(stageId: number, clickPosition: number): ClickDifferenceVerification {
        return {
            isADifference: true,
            differenceArray: [],
            differenceNumber: 4,
        };
    }
}
