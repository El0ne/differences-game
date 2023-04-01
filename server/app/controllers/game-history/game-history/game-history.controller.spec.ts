import { GameHistory, gameHistorySchema } from '@app/schemas/game-history';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { HttpStatus } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { assert } from 'console';
// import { FAKE_GAME_HISTORY } from '@app/mock/game-history-mock';
import { FAKE_GAME_HISTORY, getFakeGameHistoryElement } from '@app/mock/game-history-mock';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { stub } from 'sinon';
import * as request from 'supertest';
import { GameHistoryController } from './game-history.controller';

describe('GameHistoryController', () => {
    let controller: GameHistoryController;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;
    let gameHistoryService: GameHistoryService;
    let httpServer: unknown;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        const module: TestingModule = await Test.createTestingModule({
            imports: [MongooseModule.forRoot(mongoUri), MongooseModule.forFeature([{ name: GameHistory.name, schema: gameHistorySchema }])],
            controllers: [GameHistoryController],
            providers: [GameHistoryService],
        }).compile();

        const app = module.createNestApplication();
        await app.init();
        httpServer = app.getHttpServer();
        controller = module.get<GameHistoryController>(GameHistoryController);
        gameHistoryService = module.get<GameHistoryService>(GameHistoryService);
        connection = await module.get(getConnectionToken());
    });

    const DELAY_BEFORE_CLOSING_CONNECTION = 200;

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

    it('getGameHistory() should return the game history', async () => {
        const getGameHistoryStub = stub(gameHistoryService, 'getGameHistory').callsFake(async () => {
            return Promise.resolve(FAKE_GAME_HISTORY);
        });

        const response = await request(httpServer).get('/game-history');
        assert(getGameHistoryStub.called);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual(FAKE_GAME_HISTORY);
    });

    it('getGameHistory() should return500 if there is an error', async () => {
        stub(gameHistoryService, 'getGameHistory').throws(new Error('test'));

        const response = await request(httpServer).get('/game-history');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('addToHistory() should call GameHistoryService.addGameToHistory() with the body as a parameter', async () => {
        const gameHistoryToAdd = getFakeGameHistoryElement();

        const addGameHistoryStub = stub(gameHistoryService, 'addGameToHistory').callsFake(async () => {
            return Promise.resolve(gameHistoryToAdd);
        });

        const response = await request(httpServer).post('/game-history').send(gameHistoryToAdd);
        assert(addGameHistoryStub.called);
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toEqual(gameHistoryToAdd);
    });

    it('addToHistory() should return 500 if there is an error', async () => {
        stub(gameHistoryService, 'addGameToHistory').throws(new Error('test'));
        const response = await request(httpServer).post('/game-history').send(getFakeGameHistoryElement());
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('addToHistory() should return 400 if we pass an empty body as a parameter', async () => {
        const response = await request(httpServer).post('/game-history').send([]);
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('deleteHistory() should call GameHistoryService.deleteAllGameHistory()', async () => {
        const deleteGameHistoryStub = stub(gameHistoryService, 'deleteAllGameHistory');

        const response = await request(httpServer).delete('/game-history');
        assert(deleteGameHistoryStub.called);
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    it('deleteHistory() should return 500 if there is an error', async () => {
        const deleteGameHistoryStub = stub(gameHistoryService, 'deleteAllGameHistory').throws(new Error('error'));

        const response = await request(httpServer).delete('/game-history');
        assert(deleteGameHistoryStub.called);
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
});
