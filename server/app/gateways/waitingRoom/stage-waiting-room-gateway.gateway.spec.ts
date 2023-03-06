import { Test, TestingModule } from '@nestjs/testing';
import { StageWaitingRoomGatewayGateway } from './stage-waiting-room-gateway.gateway';

describe('StageWaitingRoomGatewayGateway', () => {
    let gateway: StageWaitingRoomGatewayGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [StageWaitingRoomGatewayGateway],
        }).compile();

        gateway = module.get<StageWaitingRoomGatewayGateway>(StageWaitingRoomGatewayGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
