/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ClickDifferenceVerification } from '@common/click-difference-verification';

export const PASSING: ClickDifferenceVerification = {
    isADifference: true,
    differenceArray: [0, 1, 2, 3, 4],
    remainingDifferences: [
        [5, 6, 7, 8],
        [19, 20, 21],
    ],
};

export const FAILING: ClickDifferenceVerification = {
    isADifference: false,
    differenceArray: [],
    remainingDifferences: [],
};

export const TEST_DIFFERENCES: number[][] = [
    [0, 1, 2, 3, 4],
    [6, 7, 8, 9],
];
