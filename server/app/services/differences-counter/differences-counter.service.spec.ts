/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { Test, TestingModule } from '@nestjs/testing';
import { stub } from 'sinon';
import { DifferencesCounterService } from './differences-counter.service';

describe('DifferencesCounterService', () => {
    let service: DifferencesCounterService;
    let imageDimensionsService: ImageDimensionsService;
    let DIFFERENT_PIXELS_LIST: boolean[];
    let VISITED_PIXELS_TEST: number[][];
    let DIFFERENT_PIXEL: number;
    let NOT_DIFFERENT_PIXEL: number;

    beforeEach(async () => {
        DIFFERENT_PIXELS_LIST = [true, true, true, false, false, true, true, false, true];
        VISITED_PIXELS_TEST = [[0, 1, 2, 5, 8], [6]];
        DIFFERENT_PIXEL = 1;
        NOT_DIFFERENT_PIXEL = 3;

        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferencesCounterService, PixelRadiusService, PixelPositionService, ImageDimensionsService],
        }).compile();

        service = module.get<DifferencesCounterService>(DifferencesCounterService);
        imageDimensionsService = module.get<ImageDimensionsService>(ImageDimensionsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findPixelDifferenceIndex() should return the index of the difference chuck if the index is visited', () => {
        expect(service.findPixelDifferenceIndex(DIFFERENT_PIXEL, VISITED_PIXELS_TEST)).toEqual(0);
    });

    it('findPixelDifferenceIndex() should return the visitedPixels length if the index is not visited', () => {
        expect(service.findPixelDifferenceIndex(NOT_DIFFERENT_PIXEL, VISITED_PIXELS_TEST)).toEqual(2);
    });

    it('getDifferencesList() should consider a diagonal pixel as adjacent', () => {
        stub(imageDimensionsService, 'getWidth').returns(2);
        stub(imageDimensionsService, 'getHeight').returns(2);
        const DIAGONAL_ADJACENT_PIXELS = [true, false, false, true];
        expect(service.getDifferencesList(DIAGONAL_ADJACENT_PIXELS)).toStrictEqual([[0, 3]]);
    });

    it('getDifferencesList() should return an array of arrays that represent the indexes of the pixels chunks', () => {
        stub(imageDimensionsService, 'getWidth').returns(3);
        stub(imageDimensionsService, 'getHeight').returns(3);
        const VISITED_PIXELS_END = VISITED_PIXELS_TEST;
        VISITED_PIXELS_END[0][4] = 8;
        expect(service.getDifferencesList(DIFFERENT_PIXELS_LIST)).toStrictEqual(VISITED_PIXELS_END);
    });
});
