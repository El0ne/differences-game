/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { Test, TestingModule } from '@nestjs/testing';
import { stub } from 'sinon';
import { DifferencesDetectionService } from './differences-detection.service';

describe('DifferencesDetectionService', () => {
    let service: DifferencesDetectionService;
    let imageDimensionsService: ImageDimensionsService;
    let DIFFERENT_PIXELS_LIST: boolean[];
    let VISITED_PIXELS_TEST: number[][];
    let DIFFERENT_PIXEL: number;
    let NOT_DIFFERENT_PIXEL: number;
    let UNVISITED_DIFFERENT_PIXEL: number;

    beforeEach(async () => {
        DIFFERENT_PIXELS_LIST = [true, true, true, false, false, true, true, false, true];
        VISITED_PIXELS_TEST = [[0, 1, 2, 5, 8], [6]];
        DIFFERENT_PIXEL = 1;
        NOT_DIFFERENT_PIXEL = 3;
        UNVISITED_DIFFERENT_PIXEL = 8;

        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferencesDetectionService, PixelRadiusService, PixelPositionService, ImageDimensionsService],
        }).compile();

        service = module.get<DifferencesDetectionService>(DifferencesDetectionService);
        imageDimensionsService = module.get<ImageDimensionsService>(ImageDimensionsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('isAVisitedPixel() should return false if findPixelDifferenceIndex return an index not reachable', () => {
        stub(service, 'findPixelDifferenceIndex').callsFake(() => 2);
        const visitedResult = service.isAVisitedPixel(NOT_DIFFERENT_PIXEL, VISITED_PIXELS_TEST);
        expect(visitedResult).toBeFalsy();
    });

    it('isAVisitedPixel() should return true if findPixelDifferenceIndex return an index not reachable', () => {
        stub(service, 'findPixelDifferenceIndex').callsFake(() => 0);
        const visitedResult = service.isAVisitedPixel(DIFFERENT_PIXEL, VISITED_PIXELS_TEST);
        expect(visitedResult).toBeTruthy();
    });

    it('findPixelDifferenceIndex() should return the index of the difference chuck if the index is visited', () => {
        expect(service.findPixelDifferenceIndex(DIFFERENT_PIXEL, VISITED_PIXELS_TEST)).toEqual(0);
    });

    it('findPixelDifferenceIndex() should return the visitedPixels length if the index is not visited', () => {
        expect(service.findPixelDifferenceIndex(NOT_DIFFERENT_PIXEL, VISITED_PIXELS_TEST)).toEqual(2);
    });

    it('isNewAndDifferentPixel() should return true only if the the pixel is not visited and is a different pixel', () => {
        expect(service.isNewAndDifferentPixel(DIFFERENT_PIXEL, DIFFERENT_PIXELS_LIST, VISITED_PIXELS_TEST)).toBeFalsy();
        expect(service.isNewAndDifferentPixel(NOT_DIFFERENT_PIXEL, DIFFERENT_PIXELS_LIST, VISITED_PIXELS_TEST)).toBeFalsy();
        VISITED_PIXELS_TEST[0].pop();
        expect(service.isNewAndDifferentPixel(UNVISITED_DIFFERENT_PIXEL, DIFFERENT_PIXELS_LIST, VISITED_PIXELS_TEST)).toBeTruthy();
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
