import { Test, TestingModule } from '@nestjs/testing';
import { GameClickController } from './game-click.controller';

describe('GameClickController', () => {
    let controller: GameClickController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameClickController],
        }).compile();

        controller = module.get<GameClickController>(GameClickController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
