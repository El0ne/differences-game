/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ClickDifferenceVerification } from '@common/click-difference-verification';

export const DIFFERENCE_FOUND: ClickDifferenceVerification = {
    isADifference: true,
    differenceArray: [0, 1, 2, 3, 4],
    differencesPosition: 5,
};

export const DIFFERENCE_NOT_FOUND: ClickDifferenceVerification = {
    isADifference: false,
    differenceArray: [],
    differencesPosition: 0,
};

export const TEST_DIFFERENCES: number[][] = [
    [0, 1, 2, 3, 4],
    [6, 7, 8, 9],
];
