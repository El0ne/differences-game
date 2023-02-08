/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { Test, TestingModule } from '@nestjs/testing';
import { assert } from 'console';
import * as Jimp from 'jimp';
import { stub } from 'sinon';
import { BLACK, DifferenceDetectionService, RGBA_DATA_LENGTH } from './difference-detection.service';

describe('DifferenceDetectionService', () => {
    let service: DifferenceDetectionService;
    let imageDimensionsService: ImageDimensionsService;
    let pixelRadiusService: PixelRadiusService;

    const TEST_IMAGE_1 = 'app/services/difference-detection/test-image1.bmp';
    const TEST_IMAGE_2 = 'app/services/difference-detection/test-image2.bmp';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferenceDetectionService, PixelRadiusService, PixelPositionService, ImageDimensionsService],
        }).compile();

        service = module.get<DifferenceDetectionService>(DifferenceDetectionService);
        imageDimensionsService = module.get<ImageDimensionsService>(ImageDimensionsService);
        pixelRadiusService = module.get<PixelRadiusService>(PixelRadiusService);

        stub(imageDimensionsService, 'getWidth').returns(640);
        stub(imageDimensionsService, 'getHeight').returns(480);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('createArray() should create an array of numbers that represents the rgba values of all pixels', async () => {
        const array = await service.createArray(TEST_IMAGE_1);
        expect(array.length).toEqual(imageDimensionsService.getNumberOfPixels() * RGBA_DATA_LENGTH);
    });

    it('compareImages() should set differenceArray to the same length as firstImageArray (and secondImageArray)', async () => {
        stub(service, 'createArray').callsFake(async () => Promise.resolve([1, 2, 3]));
        stub(service, 'createDifferenceImage').callsFake(() => {});
        await service.compareImages(TEST_IMAGE_1, TEST_IMAGE_2, 1);
        expect(service.differenceArray.length).toEqual(imageDimensionsService.getNumberOfPixels());
    });

    it('compareImages() should call createArray twice and createDifferenceImage', async () => {
        const createArrayStub = stub(service, 'createArray').callsFake(async () => Promise.resolve([1, 2, 3]));
        const createDifferenceImageStub = stub(service, 'createDifferenceImage').callsFake(() => {});
        await service.compareImages(TEST_IMAGE_1, TEST_IMAGE_2, 1);
        assert(createArrayStub.calledTwice);
        assert(createDifferenceImageStub.calledOnce);
    });

    // TODO Don't know how to test it
    // it('createDifferenceImage should set pixels to white and or to black according to the differenceArray bool values', () => {
    //     service.differenceArray = [true, true, true, false];
    //     service.createDifferenceImage();
    //     const setPixelWhiteSpy = jest.spyOn(service, 'setPixelWhite').mockImplementation();
    //     const setPixelBlackSpy = jest.spyOn(service, 'setPixelBlack').mockImplementation();
    //     expect(setPixelBlackSpy).toBeCalledTimes(1);
    //     expect(setPixelWhiteSpy).toBeCalledTimes(3);
    // });

    it('yo', () => {
        service.differenceArray = new Array(imageDimensionsService.getNumberOfPixels());
        const isPixelSameColorStub = stub(service, 'isPixelSameColor').callsFake(() => false);
        const setPixelBlackStub = stub(service, 'setPixelBlack').callsFake(() => {});
        const getAdjacentPixelsStub = stub(pixelRadiusService, 'getAdjacentPixels').callsFake(() => [0, 1, 2]);
        service.createDifferenceImage();
        assert(isPixelSameColorStub.called);
        assert(setPixelBlackStub.called);
        assert(getAdjacentPixelsStub.called);
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
});
