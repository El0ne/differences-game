import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { JoinHostInWaitingRequest, PlayerInformations, WAITING_ROOM_EVENTS } from '@common/waiting-room-socket-communication';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { StageWaitingRoomGateway } from './stage-waiting-room.gateway';

describe('StageWaitingRoomGateway', () => {
    let gateway: StageWaitingRoomGateway;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let gameCardService: SinonStubbedInstance<GameCardService>;
    let gameManagerService: SinonStubbedInstance<GameManagerService>;
    const lookedStages = ['stage1', 'stage2', 'stage3', 'stage4'];

    beforeEach(async () => {
        server = createStubInstance<Server>(Server);
        socket = createStubInstance<Socket>(Socket);
        gameCardService = createStubInstance<GameCardService>(GameCardService);
        gameManagerService = createStubInstance<GameManagerService>(GameManagerService);
        socket.data = {};
        Object.defineProperty(socket, 'id', { value: '123' });
        Object.defineProperty(server, 'sockets', { value: { sockets: new Map<string, Socket>() } });
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StageWaitingRoomGateway,
                { provide: GameCardService, useValue: gameCardService },
                { provide: GameManagerService, useValue: gameManagerService },
            ],
        }).compile();

        gateway = module.get<StageWaitingRoomGateway>(StageWaitingRoomGateway);
        gateway['server'] = server;

        gateway.gameHosts.set('stage1', 'host1').set('stage4', 'host2').set('stage5', 'host3');
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
        expect(gateway.gameHosts.get('stage1')).toBe('123');
        expect(socket.to.calledWith('stage1')).toBeTruthy();
        expect(socket.data.stageInHosting).toEqual('stage1');
    });

    it('unHostGame should send a gameDeleted to the room of the hosted game and remove the socket from the gameHosts', () => {
        socket.data.stageInHosting = 'stage1';
        socket.to.returns({
            // eslint-disable-next-line @typescript-eslint/no-empty-function, no-unused-vars
            emit: (event: string) => {},
        } as BroadcastOperator<unknown, unknown>);
        gateway.unhostGame(socket);
        expect(gateway.gameHosts.has('stage1')).toBeFalsy();
        expect(socket.to.calledWith('stage1')).toBeTruthy();
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
    });

    it('accept opponent should set the 2 players in the same room, send a matchAccepted to the opponent and a matchConfirmed its socket', () => {
        const opponentSocket = createStubInstance<Socket>(Socket);
        Object.defineProperty(opponentSocket, 'id', { value: 'opponentId' });
        opponentSocket.data = {};
        stub(opponentSocket, 'rooms').value(new Set(['stage1', 'opponentId']));
        server.sockets.sockets.set('opponentId', opponentSocket);
        socket.data.stageInHosting = 'stage1';

        socket.to.returns({
            // eslint-disable-next-line @typescript-eslint/no-empty-function, no-unused-vars
            emit: (event: string) => {},
        } as BroadcastOperator<unknown, unknown>);
        gateway.acceptOpponent(socket, { playerName: 'host1', playerSocketId: 'opponentId' });
        expect(socket.to.calledWith('stage1')).toBeTruthy();
        expect(socket.emit.calledWith(WAITING_ROOM_EVENTS.DeclineOpponent, 'randomRoomId'));
        expect(socket.data.stageInHosting).toEqual(null);
        expect(opponentSocket.data.stageInWaiting).toEqual(null);
        expect(socket.data.room).not.toBe(undefined);
        expect(opponentSocket.data.room).toEqual(socket.data.room);
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
        gateway.gameHosts.set('stageId', 'host');
        server.to.returns({
            // eslint-disable-next-line @typescript-eslint/no-empty-function, no-unused-vars
            emit: (event: string) => {},
        } as BroadcastOperator<unknown, unknown>);
        const deleteGameCardSpy = jest.spyOn(gameCardService, 'deleteGameCard');
        const deleteGameSpy = jest.spyOn(gameManagerService, 'deleteGame');
        await gateway.deleteGame('stageId');
        expect(deleteGameCardSpy).toBeCalledWith('stageId');
        expect(deleteGameSpy).toBeCalledWith('stageId');
        expect(server.to.calledWith('stageId')).toBeTruthy();
        expect(gateway.gameHosts.has('stageId')).toBeFalsy();
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
