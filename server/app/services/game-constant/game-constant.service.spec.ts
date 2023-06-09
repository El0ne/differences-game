import { getDefaultGameConstants } from '@common/game-constants';
import { Test, TestingModule } from '@nestjs/testing';
import * as path from 'path';
import { GameConstantService } from './game-constant.service';
import * as gameConstantsJson from './game-constants-test.json';

describe('GameConstantService', () => {
    let service: GameConstantService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameConstantService],
        }).compile();

        service = module.get<GameConstantService>(GameConstantService);
        Object.defineProperty(service, 'jsonPath', { value: path.join(__dirname, '/game-constants-test.json') });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getAllGameCards should return all gameCards informations', async () => {
        const gameConstants = service.getGameConstants();
        expect(gameConstants).toEqual(gameConstantsJson);
    });

    it('createGameCard should add a game card to the list of game cards', () => {
        service.updateGameConstants(getDefaultGameConstants());
        expect(getDefaultGameConstants()).toStrictEqual(gameConstantsJson);
    });
});
