import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { Injectable } from '@nestjs/common';

export const MIN_DIFF_NUMBER = 3;
export const MAX_DIFF_NUMBER = 9;
export const MIN_DIFF_NUMBER_HARD = 7;
export const MAX_DIFF_SURFACE = 0.15;

@Injectable()
export class GameDifficultyService {
    constructor(public imageDimensionsService: ImageDimensionsService) {}

    isGameValid(differenceArray: number[][]): boolean {
        if (differenceArray.length >= MIN_DIFF_NUMBER && differenceArray.length <= MAX_DIFF_NUMBER) return true;
        return false;
    }
    setGameDifficulty(differenceArray: number[][]): string {
        const fractionOfDifference = differenceArray.flat().length / this.imageDimensionsService.getNumberOfPixels();
        if (differenceArray.length >= MIN_DIFF_NUMBER_HARD && fractionOfDifference <= MAX_DIFF_SURFACE) return 'Difficile';
        return 'Facile';
    }
}