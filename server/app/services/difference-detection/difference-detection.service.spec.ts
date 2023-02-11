/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { Test, TestingModule } from '@nestjs/testing';
import { assert } from 'console';
import * as Jimp from 'jimp';
import Sinon, { stub } from 'sinon';
import { BLACK, DifferenceDetectionService, RGBA_DATA_LENGTH } from './difference-detection.service';

describe('DifferenceDetectionService', () => {
    let service: DifferenceDetectionService;
    let imageDimensionsService: ImageDimensionsService;
    let pixelRadiusService: PixelRadiusService;
    let differencesCounterService: DifferencesCounterService;
    let imageWidthStub: Sinon.SinonStub;
    let imageHeightStub: Sinon.SinonStub;

    const TEST_IMAGE_1 = 'app/services/difference-detection/test-image1.bmp';
    const TEST_IMAGE_2 = 'app/services/difference-detection/test-image2.bmp';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferenceDetectionService, PixelRadiusService, PixelPositionService, ImageDimensionsService, DifferencesCounterService],
        }).compile();

        service = module.get<DifferenceDetectionService>(DifferenceDetectionService);
        imageDimensionsService = module.get<ImageDimensionsService>(ImageDimensionsService);
        pixelRadiusService = module.get<PixelRadiusService>(PixelRadiusService);
        differencesCounterService = module.get<DifferencesCounterService>(DifferencesCounterService);

        imageWidthStub = stub(imageDimensionsService, 'getWidth');
        imageHeightStub = stub(imageDimensionsService, 'getHeight');
        imageWidthStub.returns(640);
        imageHeightStub.returns(480);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('createArray() should create an array of numbers that represents the rgba values of all pixels', async () => {
        imageWidthStub.returns(10);
        imageHeightStub.returns(10);
        const array = await service.createArray(TEST_IMAGE_1);
        expect(array.length).toEqual(imageDimensionsService.getNumberOfPixels() * RGBA_DATA_LENGTH);
    });

    it('compareImages() should set differenceArray to the same length as firstImageArray (and secondImageArray)', async () => {
        stub(service, 'createArray').returns(Promise.resolve([1, 2, 3]));
        stub(service, 'createDifferenceImage').returns(Promise.resolve([]));
        await service.compareImages(TEST_IMAGE_1, TEST_IMAGE_2, 1);
        expect(service.differenceArray.length).toEqual(imageDimensionsService.getNumberOfPixels());
    });

    it('compareImages() should call createArray twice and createDifferenceImage', async () => {
        const createArrayStub = stub(service, 'createArray').returns(Promise.resolve([1, 2, 3]));
        const createDifferenceImageStub = stub(service, 'createDifferenceImage').returns(Promise.resolve([]));
        await service.compareImages(TEST_IMAGE_1, TEST_IMAGE_2, 1);
        assert(createArrayStub.calledTwice);
        assert(createDifferenceImageStub.calledOnce);
    });

    it('createDifferenceImage should call multiple functions ', () => {
        imageWidthStub.returns(10);
        imageHeightStub.returns(10);

        service.differenceArray = new Array(imageDimensionsService.getNumberOfPixels());
        service.radius = 0;
        const image = new Jimp(imageDimensionsService.getWidth(), imageDimensionsService.getHeight(), 'white', (err) => {
            if (err) throw err;
        });
        const isPixelSameColorStub = stub(service, 'isPixelSameColor').returns(false);
        const setPixelBlackStub = stub(service, 'setPixelBlack').returns();
        const hasWhiteNeighborStub = stub(service, 'hasWhiteNeighbor').returns(true);
        const getAdjacentPixelsStub = stub(pixelRadiusService, 'getAdjacentPixels').returns([0, 1, 2]);
        const imageWriteStub = stub(image, 'write').returns(image);
        const differencesCounterStub = stub(differencesCounterService, 'getDifferencesList').returns([]);
        service.createDifferenceImage(image);
        assert(isPixelSameColorStub.called);
        assert(setPixelBlackStub.called);
        assert(hasWhiteNeighborStub.called);
        assert(getAdjacentPixelsStub.calledWith(0));
        assert(imageWriteStub.called);
        assert(differencesCounterStub.called);
    });

    it('hasWhiteNeighbor should return true if one of the pixel neighbor is white', () => {
        service.differenceArray = [true, false, false, true];
        stub(pixelRadiusService, 'getAdjacentPixels').returns([0, 2]);
        expect(service.hasWhiteNeighbor(1)).toEqual(true);
    });

    it('hasWhiteNeighbor should return false if none of the pixel neighbor are white', () => {
        service.differenceArray = [true, false, true];
        stub(pixelRadiusService, 'getAdjacentPixels').returns([0, 2]);
        expect(service.hasWhiteNeighbor(1)).toEqual(false);
    });

    it('setPixelBlack should set the index value and the 2 values after that to 0x00', () => {
        const image = new Jimp(imageDimensionsService.getWidth(), imageDimensionsService.getHeight(), 'white', (err) => {
            if (err) throw err;
        });
        const index = 0;
        service.setPixelBlack(image, index);
        for (let i = index; i < index + 2; i++) {
            expect(image.bitmap.data[i]).toBe(BLACK);
        }
    });
    it('isPixelSameColor should return true if none of the 3 following rgb values differ from the 2 compared images', () => {
        service.firstImageArray = [1, 1, 1, 1];
        service.secondImageArray = [1, 1, 1, 1];
        const index = 0;
        expect(service.isPixelSameColor(index)).toBe(true);
    });

    it('isPixelSameColor should return false if one or more of the 3 following rgb values differ from the 2 compared images', () => {
        service.firstImageArray = [1, 2, 1, 1];
        service.secondImageArray = [1, 1, 1, 1];
        const index = 1;
        expect(service.isPixelSameColor(index)).toBe(false);
    });
});
