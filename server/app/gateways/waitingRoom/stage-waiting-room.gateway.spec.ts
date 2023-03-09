import { WaitingRoomEvents } from '@common/waiting-room-socket-communication';
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

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        server = createStubInstance<Server>(Server);
        socket = createStubInstance<Socket>(Socket);
        socket.data = {};
        Object.defineProperty(socket, 'id', { value: '123' });
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
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('scanForHosts should emit a gameCreated for each of the stages where the is a host', () => {
        stub(socket, 'rooms').value(new Set([socket.id]));
        gateway.gameHosts.set('stage1', 'host1').set('stage4', 'host2').set('stage5', 'host3');
        const lookedStages = ['stage1', 'stage2', 'stage3', 'stage4'];
        gateway.scanForHosts(socket, lookedStages);
        expect(socket.emit.calledWith(WaitingRoomEvents.GameCreated, 'stage1')).toBeTruthy();
        expect(socket.emit.calledWith(WaitingRoomEvents.GameCreated, 'stage4')).toBeTruthy();
        expect(socket.emit.calledWith(WaitingRoomEvents.GameCreated, 'stage2')).toBeFalsy();
        expect(socket.emit.calledWith(WaitingRoomEvents.GameCreated, 'stage5')).toBeFalsy();
        expect(socket.join.calledWith(lookedStages)).toBeTruthy();
    });

    it('hostGame should put the socket in the gameHosts and send a gameCreated to the the stageRoom', () => {
        socket.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(WaitingRoomEvents.GameCreated);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.hostGame(socket, 'stage1');
        expect(gateway.gameHosts.get('stage1')).toBe('123');
        expect(socket.to.calledWith('stage1')).toBeTruthy();
    });

    it('test', () => {
        expect(socket.id).toBe('123');
    });
});
