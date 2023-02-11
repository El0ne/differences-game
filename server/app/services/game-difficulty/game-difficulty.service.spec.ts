/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameDifficultyService, MAX_DIFF_NUMBER, MAX_DIFF_SURFACE } from './game-difficulty.service';

describe('GameDifficultyService', () => {
    let service: GameDifficultyService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameDifficultyService, ImageDimensionsService],
        }).compile();

        service = module.get<GameDifficultyService>(GameDifficultyService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('isGameValid should return false if array length is lower than 3', () => {
        const diffArray = [
            [1, 2],
            [1, 0, 0, 1],
        ];
        expect(service.isGameValid(diffArray)).toBeFalsy();
    });

    it('isGameValid should return false if array length is greater than 9', () => {
        const diffArray = [];
        for (let i = 0; i < MAX_DIFF_NUMBER + 1; i++) diffArray.push([1]);
        expect(service.isGameValid(diffArray)).toBeFalsy();
    });

    it('isGameValid should return true if array length is 3', () => {
        const diffArray = [[1], [9], [324, 234, 12]];
        expect(service.isGameValid(diffArray)).toBeTruthy();
    });

    it('isGameValid should return false if array length is 9', () => {
        const diffArray = [];
        for (let i = 0; i < MAX_DIFF_NUMBER; i++) diffArray.push([1]);
        expect(service.isGameValid(diffArray)).toBeTruthy();
    });

    it('setGameDifficulty should return easy if array length is less than 7', () => {
        const diffArray = [[1, 2, 3, 4, 5, 6, 7]];
        expect(service.setGameDifficulty(diffArray)).toBe('Facile');
    });

    it('setGameDifficulty should return easy if array length is less than 15% of surface is difference', () => {
        const MAX_PIXEL_COUNT_VALID: number = MAX_DIFF_SURFACE * service.imageDimensionsService.getNumberOfPixels();

        const diffArray = [[1], [2], [3], [4], [5], [6], [7], [8], [9]];
        for (let i = 0; i < MAX_PIXEL_COUNT_VALID; i++) diffArray.push([i]);
        expect(service.setGameDifficulty(diffArray)).toBe('Facile');
    });

    it('setGameDifficulty should return difficult if array length >= 7 and 15% or less of surface is difference', () => {
        const diffArray = [[1], [2], [3], [4], [5], [6], [7], [8], [9]];
        expect(service.setGameDifficulty(diffArray)).toBe('Difficile');
    });
});
