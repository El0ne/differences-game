import { GameCardService } from '@app/services/game-card/game-card.service';
import { Test, TestingModule } from '@nestjs/testing';
import { StageController } from './stage.controller';

describe('StageController', () => {
    let controller: StageController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StageController],
            providers: [GameCardService],
        }).compile();
        controller = module.get<StageController>(StageController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
