import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameClickController } from './game-click.controller';

describe('GameClickController', () => {
    let controller: GameClickController;
    let httpServer: unknown;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameClickController],
            providers: [DifferenceClickService, DifferencesCounterService, PixelRadiusService, PixelPositionService, ImageDimensionsService],
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
