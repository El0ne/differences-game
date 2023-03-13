import { JoinHostInWaitingRequest, PlayerInformations, WaitingRoomEvents } from '@common/waiting-room-socket-communication';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { StageWaitingRoomGateway } from './stage-waiting-room.gateway';

describe('StageWaitingRoomGatewayGateway', () => {
    let gateway: StageWaitingRoomGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    const lookedStages = ['stage1', 'stage2', 'stage3', 'stage4'];

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        server = createStubInstance<Server>(Server);
        socket = createStubInstance<Socket>(Socket);
        socket.data = {};
        Object.defineProperty(socket, 'id', { value: '123' });
        Object.defineProperty(server, 'sockets', { value: { sockets: new Map<string, Socket>() } });
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StageWaitingRoomGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
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
        expect(socket.emit.calledWith(WaitingRoomEvents.MatchCreated, 'stage1')).toBeTruthy();
        expect(socket.emit.calledWith(WaitingRoomEvents.MatchCreated, 'stage4')).toBeTruthy();
        expect(socket.emit.calledWith(WaitingRoomEvents.MatchCreated, 'stage2')).toBeFalsy();
        expect(socket.emit.calledWith(WaitingRoomEvents.MatchCreated, 'stage5')).toBeFalsy();
        expect(socket.join.calledWith(lookedStages)).toBeTruthy();
    });

    it('hostGame should put the socket in the gameHosts and send a gameCreated to the the stageRoom', () => {
        socket.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(WaitingRoomEvents.MatchCreated);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.hostGame(socket, 'stage1');
        expect(gateway.gameHosts.get('stage1')).toBe('123');
        expect(socket.to.calledWith('stage1')).toBeTruthy();
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
        expect(socket.data.stageInHosting).toBe(undefined);
    });

    it('joinHost should send the correct requestMatch to the host', () => {
        const request: JoinHostInWaitingRequest = { stageId: 'stage1', playerName: 'name' };
        const playerInfo: PlayerInformations = { playerName: 'name', playerSocketId: '123' };
        socket.to.returns({
            emit: (event: string, data: PlayerInformations) => {
                expect(event).toEqual(WaitingRoomEvents.RequestMatch);
                expect(data).toEqual(playerInfo);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.joinHost(socket, request);
        expect(socket.to.calledWith('host1')).toBeTruthy();
    });

    it('quitHost should send the correct requestMatch to the host', () => {
        socket.data.stageInWaiting = 'stage1';
        socket.to.returns({
            emit: (event: string, playerId: string) => {
                expect(event).toEqual(WaitingRoomEvents.UnrequestMatch);
                expect(playerId).toEqual('123');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.quitHost(socket);
        expect(socket.to.calledWith('host1')).toBeTruthy();
    });

    // TODO test
    it('accept opponent should set the 2 players in the same room, send a matchAccepted to the opponent and a matchConfirmed its socket', () => {
        const opponentSocket = createStubInstance<Socket>(Socket);
        Object.defineProperty(opponentSocket, 'id', { value: 'opponentId' });
        stub(opponentSocket, 'rooms').value(new Set(['stage1', 'opponentId']));
        server.sockets.sockets.set('opponentId', opponentSocket);
        socket.data.stageInHosting = 'stage1';

        socket.to.returns({
            // eslint-disable-next-line @typescript-eslint/no-empty-function, no-unused-vars
            emit: (event: string) => {},
        } as BroadcastOperator<unknown, unknown>);
        gateway.acceptOpponent(socket, { playerName: 'host1', playerSocketId: 'opponentId' });
        expect(socket.to.calledWith('stage1')).toBeTruthy();
        expect(socket.emit.calledWith(WaitingRoomEvents.MatchConfirmed, 'randomRoomId'));
    });

    it('declineOpponent should send a matchRefusedEvent to the opponent', () => {
        socket.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(WaitingRoomEvents.MatchRefused);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.declineOpponent(socket, 'refusedOpponent');
        expect(socket.to.calledWith('refusedOpponent')).toBeTruthy();
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
