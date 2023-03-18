import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { Socket } from 'socket.io';
import { MatchGateway } from './match.gateway';

describe('MatchGateway', () => {
    let gateway: MatchGateway;
    let gameManagerServiceSpy: SinonStubbedInstance<GameManagerService>;
    let socket: SinonStubbedInstance<Socket>;

    beforeEach(async () => {
        gameManagerServiceSpy = createStubInstance<GameManagerService>(GameManagerService);
        socket = createStubInstance<Socket>(Socket);
        socket.data = {};

        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchGateway, { provide: GameManagerService, useValue: gameManagerServiceSpy }],
        }).compile();

        gateway = module.get<MatchGateway>(MatchGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('createSoloGame should call gameManagerService.addGame', async () => {
        const createGameSpy = jest.spyOn(gameManagerServiceSpy, 'addGame');
        gateway.createSoloGame(socket, 'stageId');
        expect(createGameSpy).toHaveBeenCalledWith('stageId', 1);
        expect(socket.data.stageId).toEqual('stageId');
    });

    it('handleDisconnect should call gameManagerService.endgame only if its a socket that wasa playing before', async () => {
        const endgameSpy = jest.spyOn(gameManagerServiceSpy, 'endGame');
        gateway.handleDisconnect(socket);
        expect(endgameSpy).not.toHaveBeenCalled();
        socket.data.stageId = 'stageId';
        gateway.handleDisconnect(socket);
        expect(endgameSpy).toHaveBeenCalledWith('stageId');
    });
});
