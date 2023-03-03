import { Test, TestingModule } from '@nestjs/testing';
import { StageWaitingRoomGateway } from './stage-waiting-room.gateway';

describe('StageWaitingRoomGateway', () => {
    let gateway: StageWaitingRoomGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [StageWaitingRoomGateway],
        }).compile();

        gateway = module.get<StageWaitingRoomGateway>(StageWaitingRoomGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
