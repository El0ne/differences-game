import { Test, TestingModule } from '@nestjs/testing';
import { DifferenceObjectCreationService } from './difference-object-creation.service';

describe('DifferenceObjectCreationService', () => {
    let service: DifferenceObjectCreationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DifferenceObjectCreationService],
        }).compile();

        service = module.get<DifferenceObjectCreationService>(DifferenceObjectCreationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('createJSONFromArray should return an object', () => {
        const differenceObject = service.createJSONFromArray(1, [true, true, true, false, false, false]);
        expect(differenceObject).toBeTruthy();
    });

    it('createJSONFromArray should return a difference object containing the right index and pixels', () => {
        const differenceObject = service.createJSONFromArray(1, [true, true, true, false, false, false]);
        expect(differenceObject.differenceIndex).toEqual(1);
        expect(differenceObject.differencePixels).toEqual([true, true, true, false, false, false]);
    });

    it('CreateDifferenceObject should call createJSONFromArray', () => {
        const image1 = 'image1path';
        const image2 = 'image2path';
        const radius = 3;
        const createJSONFromArraySpy = spyOn(service, 'createJSONFromArray');
        const differenceObject = service.createDifferenceObjects(image1, image2, radius);
        expect(createJSONFromArraySpy).toHaveBeenCalled();
    });

    it('CreateDifferenceObject should write a JSON object in game-differences.json', () => {
        const image1 = 'image1path';
        const image2 = 'image2path';
        const radius = 3;
        service.createDifferenceObjects(image1, image2, radius);
        const fs = require('fs');
        const differenceObject = JSON.parse(fs.readFileSync('game-differences.json', 'utf8'));
        expect(differenceObject).toBeTruthy();
    }

});
