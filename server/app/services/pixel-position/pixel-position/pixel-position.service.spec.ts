/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { Test, TestingModule } from '@nestjs/testing';
import { stub } from 'sinon';
import { outOfBoundConstant, PixelPositionService } from './pixel-position.service';

describe('PixelPositionService', () => {
    let service: PixelPositionService;
    let imageDimensionsService: ImageDimensionsService;
    let getWidthStub;
    let getHeightStub;
    let getNumberOfPixelsStub;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PixelPositionService, ImageDimensionsService],
        }).compile();

        service = module.get<PixelPositionService>(PixelPositionService);
        imageDimensionsService = module.get<ImageDimensionsService>(ImageDimensionsService);
        getWidthStub = stub(imageDimensionsService, 'getWidth').returns(640);
        getHeightStub = stub(imageDimensionsService, 'getHeight').returns(480);
        getNumberOfPixelsStub = stub(imageDimensionsService, 'getNumberOfPixels').returns(307200);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getXCoordinate should return a pixels x coordinate', () => {
        const xCoordinate = service.getXCoordinate(640);
        expect(xCoordinate).toEqual(0);
    });

    it('getYCoordinate should return a pixels y coordinate', () => {
        const yCoordinate = service.getYCoordinate((640 - 1) * 480);
        expect(yCoordinate).toEqual(480 - 1);
    });

    it('getXCoordinate should not return a pixels x coordinate if pixel position is negative', () => {
        const xCoordinate = service.getXCoordinate(-getWidthStub);
        expect(xCoordinate).toEqual(outOfBoundConstant);
    });

    it('getYCoordinate should not return a pixels y coordinate if pixel position is negative', () => {
        const yCoordinate = service.getYCoordinate(-getHeightStub);
        expect(yCoordinate).toEqual(outOfBoundConstant);
    });

    it('getXCoordinate should not return a pixels x coordinate if pixel position is greater than the array length', () => {
        const xCoordinate = service.getXCoordinate(getNumberOfPixelsStub);
        expect(xCoordinate).toEqual(outOfBoundConstant);
    });

    it('getYCoordinate should not return a pixels y coordinate if pixel position is greater than the array length', () => {
        const yCoordinate = service.getYCoordinate(getNumberOfPixelsStub);
        expect(yCoordinate).toEqual(outOfBoundConstant);
    });
});
