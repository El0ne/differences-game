import { Test, TestingModule } from '@nestjs/testing';
import * as Jimp from 'jimp';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from './difference-detection.constants';
import { DifferenceDetectionService } from './difference-detection.service';

describe('DifferenceDetectionService', () => {
    let service: DifferenceDetectionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferenceDetectionService],
        }).compile();

        service = module.get<DifferenceDetectionService>(DifferenceDetectionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('createArray() should create an array of numbers that represents the rgba values of all pixels', async () => {
        const bmpImage = 'image_12_diff.bmp';
        const NUM_OF_PIXELS = IMAGE_WIDTH * IMAGE_HEIGHT;
        const INFO_BY_PIXEL = 4;
        const array = await service.createArray(bmpImage);
        expect(array.length).toEqual(NUM_OF_PIXELS * INFO_BY_PIXEL);
    });

    it('compareImages() should set differenceArray to the same length as firstImageArray (and secondImageArray)', async () => {
        await service.compareImages();
        expect(service.differenceArray.length).not.toEqual(0);
        expect(service.differenceArray.length).toEqual(service.firstImageArray.length);
        expect(service.differenceArray.length).toEqual(service.secondImageArray.length);
    });

    it('compareImages() should call createArray twice', async () => {
        const createArraySpy = jest.spyOn(service, 'createArray').mockImplementation(async () => Promise.resolve([1, 2, 3]));
        await service.compareImages();
        expect(createArraySpy).toHaveBeenCalledTimes(2);
    });

    it('compareImages() should call createDifferenceImage ', async () => {
        const createDifferenceImageSpy = jest.spyOn(service, 'createDifferenceImage').mockImplementation();
        await service.compareImages();
        expect(createDifferenceImageSpy).toBeCalled();
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
    it('arePixelSameRGB should return true if none of the 3 following rgb values differ from the 2 compared images', () => {
        service.differenceArray = [true, true, true, false];
        const index = 0;
        expect(service.arePixelSameRGB(index)).toBe(true);
    });

    it('arePixelSameRGB should return false if one or more of the 3 following rgb values differ from the 2 compared images', () => {
        service.differenceArray = [true, true, true, false];
        const index = 1;
        expect(service.arePixelSameRGB(index)).toBe(false);
    });

    it('setPixelWhite should set the index value and the 2 values after that to 0xff', () => {
        const image = new Jimp(IMAGE_WIDTH, IMAGE_HEIGHT, 'white', (err) => {
            if (err) throw err;
        });
        const index = 0;
        const MAX_RGB_VALUE = 0xff;
        service.setPixelWhite(image, index);
        for (let i = index; i < index + 2; i++) {
            expect(image.bitmap.data[i]).toBe(MAX_RGB_VALUE);
        }
    });

    it('setPixelBlack should set the index value and the 2 values after that to 0x00', () => {
        const image = new Jimp(IMAGE_WIDTH, IMAGE_HEIGHT, 'white', (err) => {
            if (err) throw err;
        });
        const index = 0;
        const MIN_RGB_VALUE = 0x00;
        service.setPixelBlack(image, index);
        for (let i = index; i < index + 2; i++) {
            expect(image.bitmap.data[i]).toBe(MIN_RGB_VALUE);
        }
    });
});
