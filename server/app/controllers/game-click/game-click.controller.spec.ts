import { Test, TestingModule } from '@nestjs/testing';
import { GameClickController } from './game-click.controller';

describe('GameClickController', () => {
    let controller: GameClickController;
    let httpServer: unknown;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameClickController],
        }).compile();

        const app = module.createNestApplication();
        await app.init();
        httpServer = app.getHttpServer();
        controller = module.get<GameClickController>(GameClickController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
