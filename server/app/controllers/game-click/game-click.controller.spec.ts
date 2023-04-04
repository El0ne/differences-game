/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Differences, differencesSchema } from '@app/schemas/differences.schemas';
import { GameCard, gameCardSchema } from '@app/schemas/game-cards.schemas';
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/tests/constants';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { HttpStatus } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { stub } from 'sinon';
import * as request from 'supertest';
import { GameClickController } from './game-click.controller';

describe('GameClickController', () => {
    let controller: GameClickController;
    let httpServer: unknown;
    let differenceClickService;

    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoUri),
                MongooseModule.forFeature([{ name: Differences.name, schema: differencesSchema }]),
                MongooseModule.forFeature([{ name: GameCard.name, schema: gameCardSchema }]),
            ],
            controllers: [GameClickController],
            providers: [DifferenceClickService, DifferencesCounterService, PixelRadiusService, PixelPositionService, ImageDimensionsService],
        }).compile();

        const app = module.createNestApplication();
        await app.init();
        httpServer = app.getHttpServer();
        controller = module.get<GameClickController>(GameClickController);
        differenceClickService = module.get<DifferenceClickService>(DifferenceClickService);
        connection = await module.get(getConnectionToken());
    });

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('validateDifference() should return a clickDifferenceVerification', async () => {
        const differenceClickServiceStub = stub(differenceClickService, 'validateDifferencePositions').returns(FAKE_CDV);
        const response = await request(httpServer).get('/game-click').query({ x: 1, y: 2, id: 5 });
        expect(differenceClickServiceStub.calledWith('1', '2', '5')).toBeTruthy();
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual(FAKE_CDV);
    });

    it('getDifferencesFromId() should return a list of differences', async () => {
        const differenceClickServiceStub = stub(differenceClickService, 'getDifferenceArrayFromStageID').returns([]);
        const response = await request(httpServer).get('/game-click/5');
        expect(differenceClickServiceStub.calledWith('5')).toBeTruthy();
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual([]);
    });

    it('deleteDifferences() should call differenceClickService.deleteDifferences with the id passed in param', async () => {
        const differenceClickServiceStub = stub(differenceClickService, 'deleteDifferences').returns([]);
        const response = await request(httpServer).delete('/game-click/5');
        expect(differenceClickServiceStub.calledWith('5')).toBeTruthy();
        expect(response.status).toBe(HttpStatus.OK);
    });
});

const FAKE_CDV: ClickDifferenceVerification = {
    isADifference: true,
    differenceArray: [],
    differencesPosition: 3,
};
