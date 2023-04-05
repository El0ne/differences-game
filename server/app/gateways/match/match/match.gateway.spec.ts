/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { PlayerDifference } from '@common/difference-information';
import { GameHistoryDTO } from '@common/game-history.dto';
import { LIMITED_TIME_MODE_EVENTS, MATCH_EVENTS, ONE_SECOND } from '@common/match-gateway-communication';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { MatchGateway } from './match.gateway';

describe('MatchGateway', () => {
    let gateway: MatchGateway;
    let gameManagerServiceSpy: SinonStubbedInstance<GameManagerService>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    const TEST_ROOM_ID = 'test';

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

    it('difference() should emit to room a difference Event when room exists', () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data: PlayerDifference) => {
                expect(event).toEqual(MATCH_EVENTS.Difference);
                expect(data).toEqual({ differencesPosition: 3, lastDifferences: [0, 1, 2], socket: socket.id });
            },
        } as any);

        gateway.difference(socket, { differencesPosition: 3, lastDifferences: [0, 1, 2], room: TEST_ROOM_ID });
    });

    it('difference() should not emit when room does not exists', () => {
        stub(socket, 'rooms').value(new Set());
        gateway.difference(socket, { differencesPosition: 3, lastDifferences: [0, 1, 2], room: TEST_ROOM_ID });
        expect(server.to.called).toBeFalsy();
    });

    it('win() should emit to room a win Event when room exists', () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data: string) => {
                expect(event).toEqual(MATCH_EVENTS.Win);
                expect(data).toEqual(socket.id);
            },
        } as any);

        gateway.win(socket, TEST_ROOM_ID);
    });

    it('win() should not emit when room does not exists', () => {
        stub(socket, 'rooms').value(new Set());
        gateway.win(socket, TEST_ROOM_ID);
        expect(server.to.called).toBeFalsy();
    });

    it('createSoloGame should call gameManagerService.addGame or startLimitedTimeGame depending on isLimitedTimeMode', async () => {
        const createGameSpy = jest.spyOn(gameManagerServiceSpy, 'addGame');
        Object.defineProperty(socket, 'id', { value: '123' });

        await gateway.createSoloGame(socket, { stageId: 'stageId', isLimitedTimeMode: false });
        expect(createGameSpy).toHaveBeenCalledWith('stageId', 1);
        expect(socket.data.stageId).toEqual('stageId');
        expect(socket.data.room).toEqual('123');

        // const socketEmitSpy = jest.spyOn(socket, 'emit');
        const createLimitedTimeGameSpy = jest.spyOn(gameManagerServiceSpy, 'startLimitedTimeGame');
        const giveNextStageIdSpy = jest.spyOn(gameManagerServiceSpy, 'giveNextLimitedTimeStage');
        giveNextStageIdSpy.mockReturnValue('stageId1');
        await gateway.createSoloGame(socket, { stageId: 'stageId1', isLimitedTimeMode: true });
        expect(createLimitedTimeGameSpy).toHaveBeenCalledWith('123', 1);
        expect(giveNextStageIdSpy).toHaveBeenCalledWith('123');
        expect(socket.data.stageId).toEqual('stageId1');
        expect(socket.emit.calledWith(LIMITED_TIME_MODE_EVENTS.StartLimitedTimeGame, 'stageId1')).toBeTruthy();
    });

    it('handleDisconnect should call gameManagerService.endgame only if its a socket that wasa playing before', async () => {
        const endgameSpy = jest.spyOn(gameManagerServiceSpy, 'endGame');
        const removeLimitedTimePlayerSpy = jest.spyOn(gameManagerServiceSpy, 'removePlayerFromLimitedTimeGame');
        socket.data.stageId = 'stageId';
        socket.data.room = 'room';
        await gateway.handleDisconnect(socket);
        expect(endgameSpy).toHaveBeenCalledWith('stageId');
        expect(removeLimitedTimePlayerSpy).toHaveBeenCalledWith('room');
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

    it('storeSoloGame Information should store solo game information for in case of abandon', () => {
        gateway.storeSoloGameInformation(socket, FAKE_GAME_HISTORY_DTO);
        expect(socket.data.soloGame).toEqual(FAKE_GAME_HISTORY_DTO);
        expect(socket.data.isSolo).toBe(true);
    });

    it('updateGameTime Information should set the value of the internal timer', () => {
        socket.data.soloGame = {};
        gateway.updateGameTime(socket, 25);
        expect(socket.data.soloGame.gameDuration).toEqual(25);
    });
});

const FAKE_GAME_HISTORY_DTO: GameHistoryDTO = {
    gameId: 'test',
    gameName: 'game',
    gameMode: 'classique',
    gameDuration: 23,
    startTime: 'date',
    isMultiplayer: true,
    player1: {
        name: 'winner',
        hasAbandon: false,
        hasWon: true,
    },
    player2: {
        name: 'loser',
        hasAbandon: false,
        hasWon: false,
    },
};
