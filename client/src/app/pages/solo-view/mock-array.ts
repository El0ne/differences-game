/* eslint-disable @typescript-eslint/no-magic-numbers */

const difference1: number[] = [];
for (let i = 255000; i < 307201; i++) {
    difference1.push(i);
}
const difference2: number[] = [];
for (let i = 0; i < 50000; i++) {
    difference2.push(i);
}

export const MOCK_ARRAY: number[][] = [difference1, difference2];
export const TEST_ARRAY: number[][] = [difference1, difference2];
