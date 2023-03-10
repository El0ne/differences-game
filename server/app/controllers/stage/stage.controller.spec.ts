/* eslint-disable no-underscore-dangle */
// @ts-ignore

import { Differences, differencesSchema } from '@app/schemas/differences.schemas';
import { GameCard, gameCardSchema } from '@app/schemas/game-cards.schemas';
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { DifferenceDetectionService } from '@app/services/difference-detection/difference-detection.service';
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameDifficultyService } from '@app/services/game-difficulty/game-difficulty.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { GameCardDto } from '@common/game-card.dto';
import { HttpStatus } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { assert } from 'console';
import * as fs from 'fs';
import * as Jimp from 'jimp';
import { ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import * as join from 'path';
import Sinon, { stub } from 'sinon';
import * as request from 'supertest';
import { StageController } from './stage.controller';

const DELAY_BEFORE_CLOSING_CONNECTION = 200;

describe('StageController', () => {
    let httpServer: unknown;
    let controller: StageController;
    let getGameCardStub: Sinon.SinonStub;
    let getGameCardsNumberStub;
    let getGameCardByIdStub;
    let gameCardService: GameCardService;
    let imageManagerService: ImageManagerService;
    let gameManagerService: GameManagerService;

    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = await mongoServer.getUri();

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoUri),
                MongooseModule.forFeature([{ name: Differences.name, schema: differencesSchema }]),
                MongooseModule.forFeature([{ name: GameCard.name, schema: gameCardSchema }]),
            ],
            controllers: [StageController],
            providers: [
                GameCardService,
                GameDifficultyService,
                ImageDimensionsService,
                ImageManagerService,
                DifferenceDetectionService,
                PixelRadiusService,
                DifferencesCounterService,
                PixelPositionService,
                DifferenceClickService,
                GameManagerService,
            ],
        }).compile();

        const app = module.createNestApplication();
        await app.init();
        httpServer = app.getHttpServer();
        controller = module.get<StageController>(StageController);
        gameCardService = module.get<GameCardService>(GameCardService);
        imageManagerService = module.get<ImageManagerService>(ImageManagerService);
        gameManagerService = module.get<GameManagerService>(GameManagerService);
        connection = await module.get(getConnectionToken());
        getGameCardStub = stub(gameCardService, 'getGameCards');
        getGameCardsNumberStub = stub(gameCardService, 'getGameCardsNumber');
        getGameCardByIdStub = stub(gameCardService, 'getGameCardById');
    });

    afterEach((done) => {
        getGameCardStub.restore();
        getGameCardsNumberStub.restore();
        getGameCardByIdStub.restore();
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getStages() should return game cards if there are at least one', async () => {
        getGameCardStub.callsFake(() => {
            return FAKE_GAME_CARD;
        });
        const response = await request(httpServer).get('/stage');
        assert(getGameCardStub.called);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual(FAKE_GAME_CARD_ANSWER);
    });

    it('getStages() should return 500 if there is an error', async () => {
        getGameCardStub.throws(new Error('test'));
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
        getGameCardsNumberStub.throws(new Error('test'));
        const response = await request(httpServer).get('/stage/info');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('getStageById() should return a game card if the id is valid', async () => {
        getGameCardByIdStub.callsFake(() => {
            return FAKE_GAME_CARD;
        });
        const response = await request(httpServer).get('/stage/:gameCardId');
        assert(getGameCardByIdStub.called);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual(FAKE_GAME_CARD_ANSWER);
    });

    it('getStageById() should return 500 if there is an error', async () => {
        getGameCardByIdStub.throws(new Error('test'));
        const response = await request(httpServer).get('/stage/:gameCardId');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    // it('deleteGame() should call gameCardService.deleteGameCard and gameManagerService.deleteGame', async () => {
    //     jest.spyOn(gameCardService, 'deleteGameCard').mockImplementationOnce(async () => Promise.resolve());
    //     jest.spyOn(gameManagerService, 'deleteGame').mockImplementationOnce(async () => Promise.resolve());
    //     await request(httpServer).post('/stage').send(FAKE_GAME_INFO);

    //     const response = await request(httpServer).delete(`/stage/${FAKE_GAME_INFO._id}`);
    //     // expect(gameCardService.deleteGameCard).toBeCalledWith('0');
    //     // expect(gameManagerService.deleteGame).toBeCalledWith('0');
    //     expect(response.status).toBe(HttpStatus.NO_CONTENT);
    // });

    // it('deleteGame() should return 500 if there is an error', async () => {
    //     // jest.spyOn(gameCardService, 'deleteGameCard').mockImplementationOnce(async () => new Error('test'));
    //     // gameCardService.deleteGameCard = jest.fn().mockRejectedValue(new Error());
    //     jest.spyOn(gameCardService, 'deleteGameCard').mockRejectedValue(new Error());
    //     const response = await request(httpServer).delete('/stage/:gameCardId');
    //     expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    // });

    it('createGame() should call GameCardService.createGameCard() with the body as a parameter', async () => {
        const createGameCardStub = stub(gameCardService, 'createGameCard').callsFake(async () => Promise.resolve(FAKE_GAME_CARD));
        const response = await request(httpServer).post('/stage').send(FAKE_GAME_INFO);
        assert(createGameCardStub.called);
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toEqual(FAKE_GAME_CARD_ANSWER);
        createGameCardStub.restore();
    });

    it('createGame() should return 500 if there is an error', async () => {
        const createGameCardStub = stub(gameCardService, 'createGameCard').throws(new Error('test'));
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

    it('getImage() should return an  500 error if path is not functional', async () => {
        jest.spyOn(join, 'join').mockImplementationOnce(() => {
            throw new Error();
        });

        const image = new Jimp(1, 1, 'white', (err) => {
            if (err) throw err;
        });

        image.write('assets/images/test.bmp');
        const response = await request(httpServer).get('/stage/image/test.bmp');
        expect(response.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
        fs.unlink('assets/images/test.bmp', (err) => {
            if (err) throw err;
        });
    });

    it('deleteImage() should call imageManagerService.deleteImage() with the image name as a parameter', async () => {
        const image = new Jimp(1, 1, 'white', (err) => {
            if (err) throw err;
        });

        image.write('assets/images/test.bmp');
        jest.spyOn(imageManagerService, 'deleteImage');

        const response = await request(httpServer).delete('/stage/image/test.bmp');

        expect(response.status).toBe(HttpStatus.NO_CONTENT);
        expect(imageManagerService.deleteImage).toHaveBeenCalledWith('test.bmp');
    });

    it('deleteImage() should return 500 if the request is invalid', async () => {
        jest.spyOn(imageManagerService, 'deleteImage').mockImplementationOnce(() => {
            throw new Error();
        });
        const wrongImage = 'wrong_image.bmp';
        const response = await request(httpServer).delete(`/stage/image/${wrongImage}`);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(imageManagerService.deleteImage).toHaveBeenCalledWith(wrongImage);
    });
});

const FAKE_GAME_INFO: GameCardDto = {
    _id: '0',
    name: 'game.name',
    difficulty: 'Facile',
    baseImage: 'game.baseImage',
    differenceImage: 'game.differenceImage',
    radius: 3,
    differenceNumber: 6,
};

const FAKE_GAME_CARD: GameCard = {
    _id: new ObjectId('00000000773db8b853265f32'),
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

const FAKE_GAME_CARD_ANSWER = {
    _id: '00000000773db8b853265f32',
    differenceImageName: 'game.differenceImage',
    differenceNumber: 6,
    difficulty: 'Facile',
    multiTimes: [
        { name: '--', time: 0 },
        { name: '--', time: 0 },
        { name: '--', time: 0 },
    ],
    name: 'game.name',
    originalImageName: 'game.baseImage',
    soloTimes: [
        { name: '--', time: 0 },
        { name: '--', time: 0 },
        { name: '--', time: 0 },
    ],
};
