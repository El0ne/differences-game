/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
import { MatchGateway } from '@app/gateways/match/match.gateway';
import { GameCard } from '@app/schemas/game-cards.schemas';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { getFakeGameCard } from '@app/services/mock/fake-game-card';
import { JoinHostInWaitingRequest, PlayerInformations, WAITING_ROOM_EVENTS } from '@common/waiting-room-socket-communication';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { StageWaitingRoomGateway } from './stage-waiting-room.gateway';

describe('StageWaitingRoomGateway', () => {
    let gateway: StageWaitingRoomGateway;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let gameCardService: SinonStubbedInstance<GameCardService>;
    let gameManagerService: SinonStubbedInstance<GameManagerService>;
    let matchGatewayStub: SinonStubbedInstance<MatchGateway>;
    const lookedStages = ['stage1', 'stage2', 'stage3', 'stage4'];

    beforeEach(async () => {
        server = createStubInstance<Server>(Server);
        socket = createStubInstance<Socket>(Socket);
        gameCardService = createStubInstance<GameCardService>(GameCardService);
        gameManagerService = createStubInstance<GameManagerService>(GameManagerService);
        matchGatewayStub = createStubInstance<MatchGateway>(MatchGateway);
        socket.data = {};
        Object.defineProperty(socket, 'id', { value: '123' });
        Object.defineProperty(server, 'sockets', { value: { sockets: new Map<string, Socket>() } });
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StageWaitingRoomGateway,
                { provide: GameCardService, useValue: gameCardService },
                { provide: GameManagerService, useValue: gameManagerService },
                { provide: MatchGateway, useValue: matchGatewayStub },
            ],
        }).compile();

        gateway = module.get<StageWaitingRoomGateway>(StageWaitingRoomGateway);
        gateway['server'] = server;

        gateway.gameHosts
            .set('stage1', { hostId: 'host1', waitingRoom: '1' })
            .set('stage4', { hostId: 'host2', waitingRoom: '2' })
            .set('stage5', { hostId: 'host3', waitingRoom: '3' });
        stub(socket, 'rooms').value(new Set([socket.id]));
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('scanForHosts should emit a gameCreated for each of the stages where the is a host', () => {
        gateway.scanForHosts(socket, lookedStages);
        expect(socket.emit.calledWith(WAITING_ROOM_EVENTS.MatchCreated, 'stage1')).toBeTruthy();
        expect(socket.emit.calledWith(WAITING_ROOM_EVENTS.MatchCreated, 'stage4')).toBeTruthy();
        expect(socket.emit.calledWith(WAITING_ROOM_EVENTS.MatchCreated, 'stage2')).toBeFalsy();
        expect(socket.emit.calledWith(WAITING_ROOM_EVENTS.MatchCreated, 'stage5')).toBeFalsy();
        expect(socket.join.calledWith(lookedStages)).toBeTruthy();
    });

    it('hostGame should put the socket in the gameHosts and send a gameCreated to the the stageRoom', () => {
        socket.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(WAITING_ROOM_EVENTS.MatchCreated);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.hostGame(socket, 'stage1');
        expect(gateway.gameHosts.get('stage1').hostId).toBe('123');
        expect(socket.to.calledWith('stage1')).toBeTruthy();
        expect(socket.data.stageInHosting).toEqual('stage1');
    });

    it('unHostGame should send a gameDeleted to the room of the hosted game and remove the socket from the gameHosts', () => {
        socket.data.stageInHosting = 'stage1';
        socket.to.returns({
            emit: (event: string) => {},
        } as BroadcastOperator<unknown, unknown>);
        gateway.unhostGame(socket);
        expect(gateway.gameHosts.has('stage1')).toBeFalsy();
        expect(socket.to.calledWith('1')).toBeTruthy();
        expect(socket.data.stageInHosting).toBe(null);
    });

    it('joinHost should send the correct requestMatch to the host', () => {
        const request: JoinHostInWaitingRequest = { stageId: 'stage1', playerName: 'name' };
        const playerInfo: PlayerInformations = { playerName: 'name', playerSocketId: '123' };
        socket.to.returns({
            emit: (event: string, data: PlayerInformations) => {
                expect(event).toEqual(WAITING_ROOM_EVENTS.RequestMatch);
                expect(data).toEqual(playerInfo);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.joinHost(socket, request);
        expect(socket.to.calledWith('host1')).toBeTruthy();
        expect(socket.data.stageInWaiting).toBe('stage1');
        expect(socket.join.calledWith('1')).toBeTruthy();
    });

    it('quitHost should send the correct requestMatch to the host', () => {
        socket.data.stageInWaiting = 'stage1';

        socket.to.returns({
            emit: (event: string, playerId: string) => {
                expect(event).toEqual(WAITING_ROOM_EVENTS.UnrequestMatch);
                expect(playerId).toEqual('123');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.quitHost(socket);
        expect(socket.to.calledWith('host1')).toBeTruthy();
        expect(socket.data.stageInWaiting).toBe(null);
        expect(socket.leave.calledWith('1')).toBeTruthy();
    });

    it(`accept opponent should set the 2 players in the same room,
    send a matchAccepted to the opponent and a matchConfirmed its socket
    when not in limited-time-game-mode`, async () => {
        const opponentSocket = createStubInstance<Socket>(Socket);
        const opponentSocketId = 'opponentId';
        Object.defineProperty(opponentSocket, 'id', { value: opponentSocketId });
        opponentSocket.data = {};
        stub(opponentSocket, 'rooms').value(new Set(['stage1', opponentSocketId]));
        server.sockets.sockets.set(opponentSocketId, opponentSocket);
        socket.data.stageInHosting = 'stage1';

        socket.to.returns({
            emit: (event: string) => {},
        } as BroadcastOperator<unknown, unknown>);
        server.to.returns({
            emit: (event: string) => {},
        } as BroadcastOperator<unknown, unknown>);
        const addGameSpy = jest.spyOn(gameManagerService, 'addGame').mockImplementation();

        await gateway.acceptOpponent(socket, { playerName: 'host1', playerSocketId: opponentSocketId, isLimitedTimeMode: false });
        expect(socket.to.calledWith('stage1')).toBeTruthy();
        expect(socket.to.calledWith('1')).toBeTruthy();
        expect(socket.data.stageInHosting).toEqual(null);
        expect(opponentSocket.data.stageInWaiting).toEqual(null);
        expect(socket.data.room).not.toBe(undefined);
        expect(opponentSocket.data.room).toEqual(socket.data.room);
        expect(addGameSpy).toHaveBeenCalledWith('stage1', 2);

        socket.data.stageInHosting = 'limitedTimeModeTest';
        const createLimitedTimeGameSpy = jest.spyOn(matchGatewayStub, 'createLimitedTimeGame').mockImplementation();
        await gateway.acceptOpponent(socket, { playerName: 'host1', playerSocketId: opponentSocketId, isLimitedTimeMode: true });
        expect(createLimitedTimeGameSpy).toHaveBeenCalledWith(socket.data.room, 2);

        expect(socket.data.room === opponentSocket.data.room).toBeTruthy();
    });

    it('declineOpponent should send a matchRefusedEvent to the opponent', () => {
        socket.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(WAITING_ROOM_EVENTS.MatchRefused);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.declineOpponent(socket, 'refusedOpponent');
        expect(socket.to.calledWith('refusedOpponent')).toBeTruthy();
    });

    it('deleteGame should send a call services to delete game and emit to the stage room and clean the gameHost map of the stage', async () => {
        const STAGE_ID = 'stageId';
        gateway.gameHosts.set(STAGE_ID, { hostId: 'host', waitingRoom: '4' });
        server.to.returns({
            emit: (event: string) => {},
        } as BroadcastOperator<unknown, unknown>);
        const deleteGameCardSpy = jest.spyOn(gameCardService, 'deleteGameCard');
        const deleteGameSpy = jest.spyOn(gameManagerService, 'deleteGameFromDb');
        await gateway.deleteGame(STAGE_ID);
        expect(deleteGameCardSpy).toBeCalledWith(STAGE_ID);
        expect(deleteGameSpy).toBeCalledWith(STAGE_ID);
        expect(server.to.calledWith(STAGE_ID)).toBeTruthy();
        expect(gateway.gameHosts.has(STAGE_ID)).toBeFalsy();
    });
    it('deleteAllGames should call deleteGame for all the stages gameCards returned by gameCardService', async () => {
        stub(gateway, 'deleteGame');
        const deleteGameSpy = jest.spyOn(gateway, 'deleteGame').mockResolvedValue();
        const gameCards: GameCard[] = new Array(3).fill(getFakeGameCard());
        gameCardService.getAllGameCards.returns(Promise.resolve(gameCards));
        await gateway.deleteAllGames();
        expect(deleteGameSpy).toHaveBeenCalledWith(gameCards[0]._id.toString());
        expect(deleteGameSpy).toHaveBeenCalledTimes(3);
    });

    it('handleDisconnect should call unhostGame or quitHost on the right conditions', () => {
        const unhostSpy = stub(gateway, 'unhostGame').returns();
        const quitHostSpy = stub(gateway, 'quitHost').returns();

        socket.data.stageInHosting = 'gameId';
        gateway.handleDisconnect(socket);
        expect(unhostSpy.called).toBeTruthy();

        socket.data.stageInHosting = undefined;
        socket.data.stageInWaiting = 'gameId';
        gateway.handleDisconnect(socket);
        expect(quitHostSpy.called).toBeTruthy();
    });
});
