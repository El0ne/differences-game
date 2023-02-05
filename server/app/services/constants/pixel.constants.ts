/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-magic-numbers */
export const IMAGE_WIDTH = 640;
export const IMAGE_HEIGHT = 480;
// radius test 1
export const EXPECTED_PIXELS_WITH_RADIUS_OF_1 = [4, 5, 6, 644, 645, 646, 1284, 1285, 1286];
// radius test 2
export const EXPECTED_PIXELS_WITH_RADIUS_OF_0 = [27];
// radius test 3
export const EXPECTED_PIXELS_WITH_RADIUS_OF_3 = [
    0, 1, 2, 3, 4, 5, 640, 641, 642, 643, 644, 645, 1280, 1281, 1282, 1283, 1284, 1285, 1920, 1921, 1922, 1923, 1924, 1925, 2560, 2561, 2562, 2563,
    2564, 2565,
];
// radius test 4
export const EXPECTED_PIXELS_WITH_RADIUS_OF_2 = [
    305276, 305277, 305278, 305279, 305916, 305917, 305918, 305919, 306556, 306557, 306558, 306559, 307196, 307197, 307198, 307199,
];
