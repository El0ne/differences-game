/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { PlayerDifference } from '@common/difference-information';
import { GameHistoryDTO } from '@common/game-history.dto';
import { LIMITED_TIME_MODE_EVENTS, MATCH_EVENTS, ONE_SECOND } from '@common/match-gateway-communication';
import { TimerModification } from '@common/timer-modification';
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
        socket.data.room = TEST_ROOM_ID;

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
        server.to.returns({
            emit: (event: string, data: PlayerDifference) => {
                expect(event).toEqual(MATCH_EVENTS.Difference);
                expect(data).toEqual({ differencesPosition: 3, lastDifferences: [0, 1, 2], socket: socket.id });
            },
        } as any);

        gateway.difference(socket, { differencesPosition: 3, lastDifferences: [0, 1, 2] });
    });

    it('win() should emit to room a win Event when room exists', () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data: string) => {
                expect(event).toEqual(MATCH_EVENTS.Win);
                expect(data).toEqual(socket.id);
            },
        } as any);

        gateway.win(socket);
    });

    it('createSoloGame should call gameManagerService.addGame or startLimitedTimeGame depending on isLimitedTimeMode', async () => {
        const createGameSpy = jest.spyOn(gameManagerServiceSpy, 'addGame');
        Object.defineProperty(socket, 'id', { value: '123' });

        await gateway.createSoloGame(socket, { stageId: 'stageId', isLimitedTimeMode: false });
        expect(createGameSpy).toHaveBeenCalledWith('stageId', 1);
        expect(socket.data.stageId).toEqual('stageId');
        expect(socket.data.room).toEqual('123');

        const createLimitedTimeGameSpy = jest.spyOn(gameManagerServiceSpy, 'startLimitedTimeGame').mockImplementation();
        const giveNextStageIdSpy = jest.spyOn(gameManagerServiceSpy, 'giveNextStage');
        giveNextStageIdSpy.mockReturnValue('stageId1');
        await gateway.createSoloGame(socket, { stageId: 'stageId1', isLimitedTimeMode: true });
        expect(createLimitedTimeGameSpy).toHaveBeenCalledWith('123', 1);
        expect(giveNextStageIdSpy).toHaveBeenCalledWith('123');
        expect(socket.data.stageId).toEqual('stageId1');
        expect(socket.emit.calledWith(LIMITED_TIME_MODE_EVENTS.StartLimitedTimeGame, 'stageId1')).toBeTruthy();
    });

    it('handleDisconnect should call gameManagerService.endgame only if its a socket that wasa playing before', async () => {
        const endgameSpy = jest.spyOn(gameManagerServiceSpy, 'endGame').mockImplementation();
        const removeLimitedTimePlayerSpy = jest.spyOn(gameManagerServiceSpy, 'removePlayerFromLimitedTimeGame').mockImplementation();
        socket.data.stageId = 'stageId';
        await gateway.handleDisconnect(socket);
        expect(endgameSpy).toHaveBeenCalledWith('stageId');
        expect(removeLimitedTimePlayerSpy).toHaveBeenCalledWith(TEST_ROOM_ID);
    });

    it('timer should add a new timer to timer map', async () => {
        stub(socket, 'rooms').value(new Set(['test']));
        gateway.timer('test');
        jest.advanceTimersByTime(ONE_SECOND);
        expect(gateway.timers.has('test')).toBeTruthy();
    });

    it('timer should stop a timer according to room given', async () => {
        gateway.timers.set(
            TEST_ROOM_ID,
            setTimeout(() => {
                return;
            }, ONE_SECOND),
        );
        gateway.stopTimer(socket);
        expect(gateway.timers.has(TEST_ROOM_ID)).toBeFalsy();
    });

    it('storeSoloGame Information should store solo game information for in case of abandon', () => {
        gateway.storeSoloGameInformation(socket, FAKE_GAME_HISTORY_DTO);
        expect(socket.data.soloGame).toEqual(FAKE_GAME_HISTORY_DTO);
        expect(socket.data.isSolo).toBe(true);
    });

    it('nextStage should get next stage and send it to user', () => {
        const nextStageSpy = jest.spyOn(gameManagerServiceSpy, 'giveNextStage');
        nextStageSpy.mockReturnValue(undefined);
        const emitSpy = jest.spyOn(socket, 'emit');
        server.to.returns({
            emit: (event: string, data: string) => {
                expect(event).toEqual(LIMITED_TIME_MODE_EVENTS.NewStageInformation);
                expect(data).toEqual(undefined);
            },
        } as any);
        gateway.nextStage(socket);
        expect(emitSpy).toHaveBeenCalledWith(LIMITED_TIME_MODE_EVENTS.EndGame);
    });

    it('limitedTimeLost should emit a lose event', () => {
        server.to.returns({
            emit: (event: string, data: string) => {
                expect(event).toEqual(MATCH_EVENTS.Lose);
                expect(data).toEqual('timeExpired');
            },
        } as any);

        gateway.limitedTimeLost(socket);
    });

    it('startLimitedTimeTimer should create a timer for a limited time match', async () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(MATCH_EVENTS.LimitedTimeTimer);
            },
        } as any);
        socket.data.room = 'test';
        const stopTimerSpy = jest.spyOn(gateway, 'stopTimer').mockImplementation();
        gateway.startLimitedTimeTimer(socket, 123);
        jest.advanceTimersByTime(ONE_SECOND);
        expect(stopTimerSpy).toHaveBeenCalled();
        expect(gateway.timers.get('test')).toBeTruthy();
        clearInterval(gateway.timers.get('test'));
    });

    it('storeSoloGame Information should store solo game information for in case of abandon', () => {
        gateway.storeSoloGameInformation(socket, FAKE_GAME_HISTORY_DTO);
        expect(socket.data.soloGame).toBeDefined();
        expect(socket.data.isSolo).toBe(true);
    });

    it('storeGameHistoryDtoafter should store data and set isLimitedSolo to true', () => {
        gateway.storeGameHistoryDtoAfterOpponentAbandon(socket, FAKE_GAME_HISTORY_DTO);
        expect(socket.data.limitedHistory).toBe(FAKE_GAME_HISTORY_DTO);
        expect(socket.data.isLimitedSolo).toBeTruthy();
    });

    it('modifyTime should call changeTimeValue', () => {
        const changeTimeSpy = jest.spyOn(gateway, 'changeTimeValue').mockImplementation();
        gateway.modifiyTime(socket, FAKE_TIMER_MODIFICATION);
        expect(changeTimeSpy).toHaveBeenCalled();
    });

    it('changeTimeValue should stop timer and set a new timer to the same room', async () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data: number) => {
                expect(event).toEqual(MATCH_EVENTS.Timer);
                expect(data).toEqual(FAKE_TIMER_MODIFICATION.currentTime);
            },
        } as any);
        const stopTimerSpy = jest.spyOn(gateway, 'stopTimer').mockImplementation();
        gateway.changeTimeValue(socket, FAKE_TIMER_MODIFICATION);
        jest.advanceTimersByTime(ONE_SECOND);
        expect(stopTimerSpy).toHaveBeenCalled();
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

const FAKE_TIMER_MODIFICATION: TimerModification = {
    currentTime: 101,
    timeMultiplier: 2,
};
