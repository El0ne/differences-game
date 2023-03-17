/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { RoomMessage } from '@common/chat-gateway-constants';
import { ChatEvents } from '@common/chat.gateway.events';
import { PlayerDifference } from '@common/difference-information';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';

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
        socket.data = {};
        Object.defineProperty(socket, 'id', { value: 'id' });
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

    it('validate() message should take account word length', () => {
        const validWordCase = { word: 'xxxx', isValid: true };
        const invalidWordCase = {
            word: "abc def ghi jkl mno pqrs tuv wxyz ABC DEF GHI JKL MNO PQRS TUV WXYZ \
                !as§ $%& /() =?* '<> #|; ²³~ @`l ©«» ¤¼× {} abc def ghi jkl mno pqrs tuv wxyz \
                ABC DEF GHI JKL MNO PQRS TUV WXYZ !'§ $%& /() =?* '<> #",
            isValid: false,
        };
        const emptyStringTestCase = '';
        const error = 'Votre message ne respecte pas le bon format. Veuillez entrer un nouveau message';
        gateway.validate(socket, validWordCase.word);
        expect(
            socket.emit.calledWith(ChatEvents.WordValidated, { isValidated: validWordCase.isValid, originalMessage: validWordCase.word }),
        ).toBeTruthy();
        gateway.validate(socket, invalidWordCase.word);
        expect(socket.emit.calledWith(ChatEvents.WordValidated, { isValidated: invalidWordCase.isValid, originalMessage: error })).toBeTruthy();
        gateway.validate(socket, emptyStringTestCase);
        expect(socket.emit.calledWith(ChatEvents.WordValidated, { isValidated: false, originalMessage: error })).toBeTruthy();
    });

    it('difference() should emit to room a difference Event when room exists', () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data: PlayerDifference) => {
                expect(event).toEqual(ChatEvents.Difference);
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
                expect(event).toEqual(ChatEvents.Win);
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

    it('event() should emit RoomMessage and return a string containing event and par when multiplayer', () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data) => {
                expect(event).toEqual(ChatEvents.RoomMessage);
                expect(data.message.includes('Error')).toBe(true);
                expect(data.message.includes('par')).toBe(true);
            },
        } as any);
        gateway.event(socket, { room: TEST_ROOM_ID, event: 'Error', isMultiplayer: true });
    });

    it('event() should emit RoomMessage and return a string containing event without par', () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data) => {
                expect(event).toEqual(ChatEvents.RoomMessage);
                expect(data.message.includes('Différence')).toBe(true);
                expect(data.message.includes('par')).toBe(false);
            },
        } as any);
        gateway.event(socket, { room: TEST_ROOM_ID, event: 'Différence', isMultiplayer: false });
    });

    it('hint should emit RoomMessage event and include a socketid called Event', () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data) => {
                expect(event).toEqual(ChatEvents.RoomMessage);
                expect(data.message.includes('Indice')).toBe(true);
                expect(data.socketId).toEqual('event');
            },
        } as any);
        gateway.hint(socket, TEST_ROOM_ID);
    });

    it('socket disconnection should emit a disconnect to rooms', () => {
        socket.data.room = TEST_ROOM_ID;
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data: RoomMessage) => {
                expect(event).toEqual(ChatEvents.Abandon);
                expect(data.event).toEqual('abandon');
                expect(data.socketId).toEqual('id');
            },
        } as any);
        gateway.handleDisconnect(socket);
    });

    it('dateCreator should return current time', () => {
        const date = new Date();
        const hour = date.getHours().toString();
        const minutes = date.getMinutes().toString();
        const expectedDate = gateway.dateCreator();
        expect(expectedDate.includes(hour)).toBe(true);
        expect(expectedDate.includes(minutes)).toBe(true);
    });
});
