// @ts-ignore

import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameCardInformation } from '@common/game-card';
import { GameInformation } from '@common/game-information';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { assert } from 'console';
import * as Jimp from 'jimp';
import * as path from 'path';
import { stub } from 'sinon';

import * as request from 'supertest';
import { StageController } from './stage.controller';

describe('StageController', () => {
    let httpServer: unknown;
    let controller: StageController;
    let getGameCardStub;
    let getGameCardsNumberStub;
    // let gameCardService: GameCardService;
    // const mockResponse = {
    //     sendFile: jest.fn().mockImplementation((imagePath, cb) => {
    //         cb(null);
    //     }),
    //     sendStatus: jest.fn(),
    //     send: jest.fn(),
    //     status: jest.fn(),
    // };

    beforeAll(async () => {
        // gameCardService = createStubInstance(GameCardService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StageController],
            providers: [
                // {
                GameCardService,
                // useValue: gameCardService,
                // },
            ],
        }).compile();
        const app = module.createNestApplication();
        await app.init();
        httpServer = app.getHttpServer();
        controller = module.get<StageController>(StageController);
        // const gameCardService = module.get<GameCardService>(GameCardService);
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

    // it('uploadImages() should call the difference detection services with the body as a parameter and return 201', async () => {
    //     // TODO
    //     const response = await request(httpServer)
    //         .post('/stage/image/3')
    //         .attach('baseImage', 'assets/images/test-image.png')
    //         .attach('differenceImage', 'assets/images/test-image.png');
    //     expect(response.status).toBe(HttpStatus.CREATED);
    // });

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
        // make test fail to avoid merge
        // const fakeImagePath = 'fake/image/path';
        // stub(path, 'join').callsFake(() => fakeImagePath);

        // const sendFileMock = jest.fn();
        // const mockResponse = { sendFile: sendFileMock };

        // your test code
        const image = new Jimp(1, 1, 'white', (err) => {
            if (err) throw err;
        });

        image.write('assets/images/test.bmp');
        const response = await request(httpServer).get('/stage/image/test.bmp');
        // expect(sendFileMock).toHaveBeenCalledWith(fakeImagePath);
        expect(response.statusCode).toEqual(HttpStatus.OK);
    });

    it('getImage() should return 500 if there is an error', async () => {
        const wrongPath = 'fake/image/path';
        stub(path, 'join').callsFake(() => wrongPath);
        const response = await request(httpServer).get('/stage/image/sampleImageName');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
});

const FAKE_GAME_INFO: GameInformation = {
    name: 'Fake Title',
    baseImage: 'baseImage/path',
    differenceImage: 'differenceImage/path',
    radius: 3,
};

const FAKE_GAME_CARD: GameCardInformation = {
    name: 'Library',
    difficulty: 'Difficile',
    originalImage: '/assets/444-640x480.jpg',
    differenceImage: '/assets/444-640x480.jpg',
    soloTimes: [
        { time: 60, name: 're' },
        { time: 90, name: 'second' },
        { time: 105, name: 'third' },
    ],
    multiTimes: [
        { time: 63, name: 'First' },
        { time: 92, name: 'second' },
        { time: 115, name: 'third' },
    ],
};

const FAKE_GAME_CARD_ARRAY: GameCardInformation[] = [FAKE_GAME_CARD, FAKE_GAME_CARD];
