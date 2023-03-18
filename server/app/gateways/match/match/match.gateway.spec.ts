import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { MatchGateway } from './match.gateway';

describe('MatchGateway', () => {
    let gateway: MatchGateway;
    const mockService = { endGame: jest.fn() };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchGateway, { provide: GameManagerService, useValue: mockService }],
        }).compile();

        gateway = module.get<MatchGateway>(MatchGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
