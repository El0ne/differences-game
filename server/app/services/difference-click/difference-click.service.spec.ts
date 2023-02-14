/* eslint-disable @typescript-eslint/no-magic-numbers */
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { Test, TestingModule } from '@nestjs/testing';
import * as path from 'path';
import { DifferenceClickService } from './difference-click.service';
import { differenceObjects } from './differents-test.json';

describe('DifferenceClickService', () => {
    let service: DifferenceClickService;
    let imageDimService: ImageDimensionsService;
    let differenceCounterService: DifferencesCounterService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferenceClickService, DifferencesCounterService, PixelRadiusService, PixelPositionService, ImageDimensionsService],
        }).compile();

        service = module.get<DifferenceClickService>(DifferenceClickService);
        service.jsonPath = path.join(__dirname, '/differents-test.json');

        imageDimService = module.get<ImageDimensionsService>(ImageDimensionsService);
        differenceCounterService = module.get<DifferencesCounterService>(DifferencesCounterService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getAlldifferenceArrays should return all game differences from arrays', async () => {
        const differences = service.getAllDifferenceArrays();
        expect(differences).toEqual(differenceObjects);
    });

    it('getDifferenceArrayFromStageId should return an array given a certain id', async () => {
        const differences = service.getDifferenceArrayFromStageID('1');
        expect(differences).toEqual(differenceObjects.find((difference) => (difference.id = '1')).differences);
    });

    it('createDifferenceArray should create a difference array given an id and the array', async () => {
        const differences = service.getAllDifferenceArrays();
        service.createDifferenceArray('2', [
            [123, 124, 125],
            [1, 2, 3],
        ]);
        const addedDifferences = service.getAllDifferenceArrays();
        const getDifferences = service.getDifferenceArrayFromStageID('2');
        expect(differences.length).not.toEqual(addedDifferences.length);
        expect(getDifferences).toBeTruthy();
    });

    it('validateDifferencePosition should determine if click is a difference', async () => {
        jest.spyOn(imageDimService, 'getWidth').mockReturnValue(640);
        jest.spyOn(differenceCounterService, 'findPixelDifferenceIndex').mockReturnValue(0);

        const result = service.validateDifferencePositions(0, 0, '1');
        expect(result.isADifference).toBe(true);
        expect(result.differenceArray).toEqual([0, 1, 2, 3]);
        expect(result.differencesPosition).toEqual(0);
    });

    it('validateDifferencePosition should determine if click is not a difference', async () => {
        jest.spyOn(imageDimService, 'getWidth').mockReturnValue(640);
        jest.spyOn(differenceCounterService, 'findPixelDifferenceIndex').mockReturnValue(2);

        const result = service.validateDifferencePositions(100, 100, '1');
        expect(result.isADifference).toBe(false);
        expect(result.differencesPosition).toEqual(2);
        expect(result.differenceArray).toEqual([]);
    });
});
