/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, match, SinonStubbedInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    const TEST_ROOM_ID = 'test';

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
            ],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('received message should be logged', () => {
        gateway.message(socket, 'X');
        expect(logger.log.called).toBeTruthy();
    });

    it('validate() message should take account word length', () => {
        const testCases = [
            { word: 'xxxx', isValid: true },
            {
                word: "abc def ghi jkl mno pqrs tuv wxyz ABC DEF GHI JKL MNO PQRS TUV WXYZ \
                !as§ $%& /() =?* '<> #|; ²³~ @`l ©«» ¤¼× {} abc def ghi jkl mno pqrs tuv wxyz \
                ABC DEF GHI JKL MNO PQRS TUV WXYZ !'§ $%& /() =?* '<> #",
                isValid: false,
            },
        ];
        const emptyStringTestCase = '';
        for (const { word, isValid } of testCases) {
            gateway.validate(socket, word);
            expect(socket.emit.calledWith(ChatEvents.WordValidated, { validated: isValid, originalMessage: word })).toBeTruthy();
        }
        gateway.validate(socket, emptyStringTestCase);
        expect(socket.emit.calledWith(ChatEvents.WordValidated, { validated: false }));
    });

    it('broadcastAll() should send a mass message to the server', () => {
        gateway.broadcastAll(socket, 'X');
        expect(server.emit.calledWith(ChatEvents.MassMessage, match.any)).toBeTruthy();
    });

    it('joinRoom() should join the socket room', () => {
        gateway.joinRoom(socket, TEST_ROOM_ID);
        expect(socket.join.calledOnce).toBeTruthy();
    });

    it('roomMessage() should not send message if socket not in the room', () => {
        stub(socket, 'rooms').value(new Set());
        gateway.roomMessage(socket, { room: TEST_ROOM_ID, message: 'X' });
        expect(server.to.called).toBeFalsy();
    });

    it('roomMessage() should send message if socket in the room', () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, message) => {
                expect(event).toEqual(ChatEvents.RoomMessage);
                expect(message.message).toEqual('X');
            },
        } as any);
        gateway.roomMessage(socket, { room: TEST_ROOM_ID, message: 'X' });
    });

    it('event() should emit event and return a string containing event and par when multiplayer', () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data) => {
                expect(event).toEqual(ChatEvents.Event);
                expect(data.message.includes('Error')).toBe(true);
                expect(data.message.includes('par')).toBe(true);
            },
        } as any);
        gateway.event(socket, { room: TEST_ROOM_ID, event: 'Error', multiplayer: true });
    });

    it('event() should emit event and return a string containing event without par', () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data) => {
                expect(event).toEqual(ChatEvents.Event);
                expect(data.message.includes('Différence')).toBe(true);
                expect(data.message.includes('par')).toBe(false);
            },
        } as any);
        gateway.event(socket, { room: TEST_ROOM_ID, event: 'Différence', multiplayer: false });
    });

    it('abandon should emit a hint event and include player name in the alert message', () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data) => {
                expect(event).toEqual(ChatEvents.Hint);
                expect(data.message.includes('Player 1')).toBe(true);
                expect(data.socketId).toEqual('event');
            },
        } as any);
        gateway.abandon(socket, { room: TEST_ROOM_ID, name: 'Player 1' });
    });

    it('hint should emit hint event and include a socketid called Event', () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data) => {
                expect(event).toEqual(ChatEvents.Hint);
                expect(data.message.includes('Indice')).toBe(true);
                expect(data.socketId).toEqual('event');
            },
        } as any);
        gateway.hint(socket, TEST_ROOM_ID);
    });

    it('afterInit() should emit time after 1s', () => {
        jest.useFakeTimers();
        gateway.afterInit();
        jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
        expect(server.emit.calledWith(ChatEvents.Clock, match.any)).toBeTruthy();
    });

    it('hello message should be sent on connection', () => {
        gateway.handleConnection(socket);
        expect(socket.emit.calledWith(ChatEvents.Hello, match.any)).toBeTruthy();
    });

    it('socket disconnection should be logged', () => {
        gateway.handleDisconnect(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });
});
