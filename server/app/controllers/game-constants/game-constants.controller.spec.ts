/* eslint-disable @typescript-eslint/no-empty-function */
import { GameConstantService } from '@app/services/game-constant/game-constant.service';
import { FAKE_GAME_CONSTANTS } from '@common/mock/game-constants-mock';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { assert } from 'console';
import { stub } from 'sinon';
import * as request from 'supertest';
import { GameConstantsController } from './game-constants.controller';

describe('GameConstantsController', () => {
    let httpServer: unknown;
    let controller: GameConstantsController;
    let gameConstantService: GameConstantService;
    let getGameConstantsStub;
    let updateGameConstantsStub;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameConstantsController],
            providers: [GameConstantService],
        }).compile();

        const app = module.createNestApplication();
        await app.init();
        httpServer = app.getHttpServer();
        controller = module.get<GameConstantsController>(GameConstantsController);
        gameConstantService = module.get<GameConstantService>(GameConstantService);
        getGameConstantsStub = stub(gameConstantService, 'getGameConstants');
        updateGameConstantsStub = stub(gameConstantService, 'updateGameConstants');
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getGameConstants() should call getGameConstants method from service', async () => {
        getGameConstantsStub.callsFake(() => {
            return FAKE_GAME_CONSTANTS;
        });
        const response = await request(httpServer).get('/game-constants');
        assert(getGameConstantsStub.called);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual(FAKE_GAME_CONSTANTS);
    });

    it('getGameConstants() should return 500 if there is an error', async () => {
        getGameConstantsStub.throws(new Error('test'));
        const response = await request(httpServer).get('/game-constants');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('updateGameConstants() should call GameConstantService.updateGameConstants() with the body as a parameter', async () => {
        const response = await request(httpServer).put('/game-constants').send(FAKE_GAME_CONSTANTS);
        assert(updateGameConstantsStub.called);
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });
    it('updateGameConstants() should return 500 if there is an error', async () => {
        updateGameConstantsStub.throws(new Error('test'));
        const response = await request(httpServer).put('/game-constants').send(FAKE_GAME_CONSTANTS);
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
});
