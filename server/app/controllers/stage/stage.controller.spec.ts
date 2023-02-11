// @ts-ignore

import { DifferenceDetectionService } from '@app/services/difference-detection/difference-detection.service';
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameDifficultyService } from '@app/services/game-difficulty/game-difficulty.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { GameCardInformation } from '@common/game-card';
import { GameInformation } from '@common/game-information';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { assert } from 'console';
import * as fs from 'fs';
import * as Jimp from 'jimp';
import { stub } from 'sinon';
import * as request from 'supertest';
import { StageController } from './stage.controller';

describe('StageController', () => {
    let httpServer: unknown;
    let controller: StageController;
    let getGameCardStub;
    let getGameCardsNumberStub;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StageController],
            providers: [
                GameCardService,
                DifferenceDetectionService,
                PixelRadiusService,
                ImageDimensionsService,
                DifferencesCounterService,
                PixelPositionService,
                GameDifficultyService,
            ],
        }).compile();
        const app = module.createNestApplication();
        await app.init();
        httpServer = app.getHttpServer();
        controller = module.get<StageController>(StageController);
    });

    beforeEach(() => {
        getGameCardStub = stub(controller.gameCardService, 'getGameCards');
        getGameCardsNumberStub = stub(controller.gameCardService, 'getGameCardsNumber');
    });

    afterEach(() => {
        getGameCardStub.restore();
        getGameCardsNumberStub.restore();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    it('getStages() should return game cards if there are at least one', async () => {
        getGameCardStub.callsFake(() => {
            return FAKE_GAME_CARD_ARRAY;
        });
        const response = await request(httpServer).get('/stage');
        assert(getGameCardStub.called);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual(FAKE_GAME_CARD_ARRAY);
    });

    it('getStages() should return 500 if there is an error', async () => {
        getGameCardStub.callsFake(() => {
            throw new Error();
        });
        const response = await request(httpServer).get('/stage');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('getNbOfStages() should return the game cards number', async () => {
        getGameCardsNumberStub.callsFake(() => 3);
        const response = await request(httpServer).get('/stage/info');
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.text).toEqual('3');
    });

    it('getNbOfStages() should return 500 if there is an error', async () => {
        getGameCardsNumberStub.callsFake(() => {
            throw new Error();
        });
        const response = await request(httpServer).get('/stage/info');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('createGame() should call GameCardService.createGameCard() with the body as a parameter', async () => {
        const createGameCardStub = stub(controller.gameCardService, 'createGameCard').callsFake(() => FAKE_GAME_CARD_ARRAY[0]);
        const response = await request(httpServer).post('/stage').send(FAKE_GAME_INFO);
        assert(createGameCardStub.called);
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toEqual(FAKE_GAME_CARD);
        createGameCardStub.restore();
    });

    it('createGame() should return 500 if there is an error', async () => {
        const createGameCardStub = stub(controller.gameCardService, 'createGameCard').callsFake(() => {
            throw new Error();
        });
        const response = await request(httpServer).post('/stage').send(FAKE_GAME_INFO);
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        createGameCardStub.restore();
    });

    it('createGame() should return 400 if we pass an empty body as a parameter', async () => {
        const response = await request(httpServer).post('/stage').send([]);
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('uploadImages() should return 400 if we pass an empty body as a parameter', async () => {
        const response = await request(httpServer)
            .post('/stage/image/3')
            .attach('baseImage', Buffer.from(''))
            .attach('differenceImage', Buffer.from(''));
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('uploadImages() should return 500 if there is an error', async () => {
        const response = await request(httpServer).post('/stage/image/3');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('getImage() should return an image if the imageName is valid', async () => {
        const image = new Jimp(1, 1, 'white', (err) => {
            if (err) throw err;
        });

        image.write('assets/images/test.bmp');
        const response = await request(httpServer).get('/stage/image/test.bmp');
        expect(response.statusCode).toEqual(HttpStatus.OK);
        fs.unlink('assets/images/test.bmp', (err) => {
            if (err) throw err;
        });
    });
});
const FAKE_GAME_INFO: GameInformation = {
    id: 0,
    name: 'game.name',
    difficulty: 'Facile',
    baseImage: 'game.baseImage',
    differenceImage: 'game.differenceImage',
    radius: 3,
    differenceNumber: 6,
};
const FAKE_GAME_CARD: GameCardInformation = {
    id: 0,
    name: 'game.name',
    difficulty: 'Facile',
    differenceNumber: 6,
    originalImageName: 'game.baseImage',
    differenceImageName: 'game.differenceImage',
    soloTimes: [
        { time: 0, name: '--' },
        { time: 0, name: '--' },
        { time: 0, name: '--' },
    ],
    multiTimes: [
        { time: 0, name: '--' },
        { time: 0, name: '--' },
        { time: 0, name: '--' },
    ],
};

const FAKE_GAME_CARD_ARRAY: GameCardInformation[] = [FAKE_GAME_CARD, FAKE_GAME_CARD];
