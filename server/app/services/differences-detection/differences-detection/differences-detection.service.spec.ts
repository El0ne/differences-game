import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { Test, TestingModule } from '@nestjs/testing';
import { stub } from 'sinon';
import { DifferencesDetectionService } from './differences-detection.service';

describe('DifferencesDetectionService', () => {
    let service: DifferencesDetectionService;
    const DIFFERENT_PIXELS_LIST = [true, true, true, false, false, false, true, true, true];
    const VISITED_PIXELS_TEST = [
        [0, 1, 2],
        [6, 7],
    ];
    const DIFFERENT_PIXEL = 1;
    const NOT_DIFFERENT_PIXEL = 3;
    const UNVISITED_DIFFERENT_PIXEL = 8;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferencesDetectionService, PixelRadiusService, PixelPositionService],
        }).compile();

        service = module.get<DifferencesDetectionService>(DifferencesDetectionService);
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

    it('findPixelDifferenceIndex() should return the visitedPixels length if the index is not visited', () => {
        expect(service.findPixelDifferenceIndex(NOT_DIFFERENT_PIXEL, VISITED_PIXELS_TEST)).toEqual(2);
    });

    it('isNewAndDifferentPixel() should return true only if the the pixel is not visited and is a different pixel', () => {
        expect(service.isNewAndDifferentPixel(DIFFERENT_PIXEL, DIFFERENT_PIXELS_LIST, VISITED_PIXELS_TEST)).toBeFalsy();
        expect(service.isNewAndDifferentPixel(NOT_DIFFERENT_PIXEL, DIFFERENT_PIXELS_LIST, VISITED_PIXELS_TEST)).toBeFalsy();
        expect(service.isNewAndDifferentPixel(UNVISITED_DIFFERENT_PIXEL, DIFFERENT_PIXELS_LIST, VISITED_PIXELS_TEST)).toBeTruthy();
    });
});
