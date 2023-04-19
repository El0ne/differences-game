import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { Injectable } from '@nestjs/common';
import { MAX_DIFF_NUMBER, MAX_DIFF_SURFACE, MIN_DIFF_NUMBER, MIN_DIFF_NUMBER_HARD } from './game-difficulty.const';

@Injectable()
export class GameDifficultyService {
    constructor(private imageDimensionsService: ImageDimensionsService) {}

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
