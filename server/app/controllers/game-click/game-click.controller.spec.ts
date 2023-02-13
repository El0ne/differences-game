import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { assert } from 'console';
import { stub } from 'sinon';
import * as request from 'supertest';
import { GameClickController } from './game-click.controller';

describe('GameClickController', () => {
    let controller: GameClickController;
    let httpServer: unknown;
    let differenceClickService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameClickController],
            providers: [DifferenceClickService, DifferencesCounterService, PixelRadiusService, PixelPositionService, ImageDimensionsService],
        }).compile();

        const app = module.createNestApplication();
        await app.init();
        httpServer = app.getHttpServer();
        controller = module.get<GameClickController>(GameClickController);
        differenceClickService = module.get<DifferenceClickService>(DifferenceClickService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('validateDifference() should return game cards if there are at least one', async () => {
        const differenceClickServiceStub = stub(differenceClickService, 'validateDifferencePositions').returns(FAKE_CDV);
        const response = await request(httpServer).get('/game-click');
        assert(differenceClickServiceStub.called);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual(FAKE_CDV);
    });
});

const FAKE_CDV: ClickDifferenceVerification = {
    isADifference: true,
    differenceArray: [],
    differencesPosition: 3,
};
