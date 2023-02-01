import { Test, TestingModule } from '@nestjs/testing';
import * as Jimp from 'jimp';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from './difference-detection.constants';
import { DifferenceDetectionService } from './difference-detection.service';

describe('DifferenceDetectionService', () => {
    let service: DifferenceDetectionService;
    let createDifferenceImageSpy;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferenceDetectionService],
        }).compile();

        service = module.get<DifferenceDetectionService>(DifferenceDetectionService);
        createDifferenceImageSpy = jest.spyOn(service, 'createDifferenceImage').mockImplementation();
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

    // it('compareImages() should set differenceArray to the same length as firstImageArray (and secondImageArray)', async () => {
    //     await service.compareImages();
    //     expect(service.differenceArray.length).not.toEqual(0);
    //     expect(service.differenceArray.length).toEqual(service.firstImageArray.length);
    //     expect(service.differenceArray.length).toEqual(service.secondImageArray.length);
    // });

    it('compareImages() should call createArray twice', async () => {
        const createArraySpy = jest.spyOn(service, 'createArray').mockImplementation(async () => Promise.resolve([1, 2, 3]));
        await service.compareImages();
        expect(createArraySpy).toHaveBeenCalledTimes(2);
    });

    it('compareImages() should call createDifferenceImage ', async () => {
        await service.compareImages();
        expect(createDifferenceImageSpy).toBeCalled();
    });

    // TODO Don't know how to test it
    // it('createDifferenceImage should set pixels to white and or to black according to the differenceArray bool values', () => {
    //     service.firstImageArray = [0, 0, 0, 0];
    //     service.secondImageArray = [0, 0, 1, 0];
    //     const scanSpy = jest.spyOn(service.image, 'scan').mockImplementation();
    //     service.createDifferenceImage();
    //     expect(scanSpy).toBeCalled();
    //     // const setPixelWhiteSpy = jest.spyOn(service, 'setPixelWhite').mockImplementation();
    //     // const setPixelBlackSpy = jest.spyOn(service, 'setPixelBlack').mockImplementation();
    //     // expect(setPixelBlackSpy).toBeCalledTimes(1);
    //     // expect(setPixelWhiteSpy).toBeCalledTimes(3);
    // });

    it('isSamePixelColor should return true if all 4 info about a pixel are the same in both images', () => {
        service.firstImageArray = [0, 0, 0, 0];
        service.secondImageArray = [0, 0, 0, 0];
        expect(service.isSamePixelColor(0)).toEqual(true);
    });

    it('isSamePixelColor should return false if at least one of 4 info about a pixel are the same in both images', () => {
        service.firstImageArray = [0, 0, 0, 0];
        service.secondImageArray = [0, 1, 0, 0];
        expect(service.isSamePixelColor(0)).toEqual(false);
    });

    // TODO. Fix when both array are size 3. undefined on both sides returns true
    it('isSamePixelColor should return false if there is less than 4 info about a pixel are the same in both images', () => {
        service.firstImageArray = [1, 0, 0];
        service.secondImageArray = [0, 0, 0, 0];
        expect(service.isSamePixelColor(0)).toEqual(false);
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
