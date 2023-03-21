/* eslint-disable @typescript-eslint/no-explicit-any */
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { ONE_SECOND } from '@common/match-gateway-communication';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { MatchGateway } from './match.gateway';

describe('MatchGateway', () => {
    let gateway: MatchGateway;
    let gameManagerServiceSpy: SinonStubbedInstance<GameManagerService>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        jest.useFakeTimers();
        gameManagerServiceSpy = createStubInstance<GameManagerService>(GameManagerService);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);

        server.to.returns({
            // eslint-disable-next-line no-unused-vars
            emit: (event: string, data: number) => {
                return;
            },
        } as BroadcastOperator<unknown, unknown>);

        socket.data = {};

        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchGateway, { provide: GameManagerService, useValue: gameManagerServiceSpy }],
        }).compile();

        gateway = module.get<MatchGateway>(MatchGateway);
        gateway['server'] = server;
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

    it('timer should add a new timer to timer map', async () => {
        stub(socket, 'rooms').value(new Set(['test']));
        gateway.timer('test');
        jest.advanceTimersByTime(ONE_SECOND);
        expect(gateway.timers.has('test')).toBeTruthy();
    });

    it('timer should stop a timer according to room given', async () => {
        gateway.timers.set(
            'room',
            setTimeout(() => {
                return;
            }, ONE_SECOND),
        );
        gateway.stopTimer(socket, 'room');
        expect(gateway.timers.has('room')).toBeFalsy();
    });
});