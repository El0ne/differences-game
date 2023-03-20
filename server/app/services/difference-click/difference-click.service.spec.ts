/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Differences, DifferencesDocument, differencesSchema } from '@app/schemas/differences.schemas';
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { DifferenceClickService } from './difference-click.service';

describe('DifferenceClickService', () => {
    let service: DifferenceClickService;
    let imageDimService: ImageDimensionsService;
    let differenceCounterService: DifferencesCounterService;
    let differenceModel: Model<DifferencesDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Differences.name, schema: differencesSchema }]),
            ],
            providers: [DifferenceClickService, DifferencesCounterService, PixelRadiusService, PixelPositionService, ImageDimensionsService],
        }).compile();

        service = module.get<DifferenceClickService>(DifferenceClickService);

        imageDimService = module.get<ImageDimensionsService>(ImageDimensionsService);
        differenceCounterService = module.get<DifferencesCounterService>(DifferencesCounterService);
        differenceModel = module.get<Model<DifferencesDocument>>(getModelToken(Differences.name));
        connection = await module.get(getConnectionToken());
        await differenceModel.deleteMany({});
    });

    const DELAY_BEFORE_CLOSING_CONNECTION = 200;

    afterEach((done) => {
        setTimeout(async () => {
            await mongoServer.stop();
            await connection.close();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(differenceModel).toBeDefined();
    });

    it('getAllDifferenceArrays should return all game differences from arrays', async () => {
        expect((await service.getAllDifferenceArrays()).length).toEqual(0);
        const differenceObject = getFakeDifferences();
        await differenceModel.create(differenceObject);
        expect((await service.getAllDifferenceArrays()).length).toEqual(1);
        expect(await service.getAllDifferenceArrays()).toEqual([expect.objectContaining(differenceObject)]);
    });

    it('getDifferenceArrayFromStageId should return an array given a certain id', async () => {
        const differencesArray = getFakeDifferencesArray();
        const id = await service.createDifferenceArray(differencesArray);
        const difference = await service.getDifferenceArrayFromStageID(id);
        expect(difference).toEqual(differencesArray);
    });

    it('getDifferenceArrayFromStageId should return an empty array if id is not found', async () => {
        const differences = await service.getDifferenceArrayFromStageID(new ObjectId().toHexString());
        expect(differences).toEqual([]);
    });

    it('deleteDifferences should call differenceModel.FindByIdAndDelete with a certain id', async () => {
        const differencesArray = getFakeDifferencesArray();
        const id = await service.createDifferenceArray(differencesArray);
        const findAndDeleteMock = jest.spyOn(differenceModel, 'findByIdAndDelete');
        await service.deleteDifferences(id);
        expect(findAndDeleteMock).toHaveBeenCalledWith(id);
    });

    it('createDifferenceArray should create a difference array given an id and the array', async () => {
        const originalDifferences = await service.getAllDifferenceArrays();
        const differencesArray = getFakeDifferencesArray();
        const id = await service.createDifferenceArray(differencesArray);
        const newDifferences = await service.getAllDifferenceArrays();
        const addedDifferencesObject = await service.getDifferenceArrayFromStageID(id);
        expect(originalDifferences.length + 1).toEqual(newDifferences.length);
        expect(addedDifferencesObject).toEqual(differencesArray);
    });

    it('validateDifferencePosition should determine if click is a difference', async () => {
        jest.spyOn(imageDimService, 'getWidth').mockReturnValue(640);
        jest.spyOn(differenceCounterService, 'findPixelDifferenceIndex').mockReturnValue(0);

        const id = await service.createDifferenceArray(getFakeDifferencesArray());
        const result = await service.validateDifferencePositions(0, 0, id);
        expect(result.isADifference).toBe(true);
        expect(result.differenceArray).toEqual([0, 1, 2, 3]);
        expect(result.differencesPosition).toEqual(0);
    });

    it('validateDifferencePosition should determine if click is not a difference', async () => {
        jest.spyOn(imageDimService, 'getWidth').mockReturnValue(640);
        jest.spyOn(differenceCounterService, 'findPixelDifferenceIndex').mockReturnValue(2);

        const id = await service.createDifferenceArray(getFakeDifferencesArray());
        const result = await service.validateDifferencePositions(100, 100, id);
        expect(result.isADifference).toBe(false);
        expect(result.differenceArray).toEqual([]);
        expect(result.differencesPosition).toEqual(2);
    });
});

const getFakeDifferences = (): Differences => ({
    differences: getFakeDifferencesArray(),
});

const getFakeDifferencesArray = (): number[][] => {
    return [
        [0, 1, 2, 3],
        [7, 8, 9, 10],
    ];
};
