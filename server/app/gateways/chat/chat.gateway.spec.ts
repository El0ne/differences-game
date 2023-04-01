/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { MatchGateway } from '@app/gateways/match/match/match.gateway';
import { StageWaitingRoomGateway } from '@app/gateways/waitingRoom/stage-waiting-room.gateway';
import { Differences, differencesSchema } from '@app/schemas/differences.schemas';
import { GameCard, gameCardSchema } from '@app/schemas/game-cards.schemas';
import { GameHistory, gameHistorySchema } from '@app/schemas/game-history';
import { BestTimesService } from '@app/services/best-times/best-times.service';
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { DifferenceDetectionService } from '@app/services/difference-detection/difference-detection.service';
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameConstantService } from '@app/services/game-constant/game-constant.service';
import { GameDifficultyService } from '@app/services/game-difficulty/game-difficulty.service';
import { GameHistoryService } from '@app/services/game-history/game-history/game-history.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { RoomMessage } from '@common/chat-gateway-constants';
import { CHAT_EVENTS } from '@common/chat-gateway-events';
import { GameHistoryDTO } from '@common/game-history.dto';
import { Logger } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';

const DELAY_BEFORE_CLOSING_CONNECTION = 200;
describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    const TEST_ROOM_ID = 'test';
    let gameHistoryService;
    let gameCardService;

    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = await mongoServer.getUri();

        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        socket.data = {};
        Object.defineProperty(socket, 'id', { value: 'id' });
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoUri),
                MongooseModule.forFeature([{ name: GameCard.name, schema: gameCardSchema }]),
                MongooseModule.forFeature([{ name: GameHistory.name, schema: gameHistorySchema }]),
                MongooseModule.forFeature([{ name: Differences.name, schema: differencesSchema }]),
            ],
            providers: [
                ChatGateway,
                {
                    provide: Logger,
                    useValue: logger,
                },
                StageWaitingRoomGateway,
                Logger,
                GameCardService,
                GameDifficultyService,
                DifferenceClickService,
                DifferenceDetectionService,
                DifferencesCounterService,
                PixelRadiusService,
                PixelPositionService,
                ImageDimensionsService,
                ImageManagerService,
                GameManagerService,
                MatchGateway,
                GameConstantService,
                BestTimesService,
                GameHistoryService,
            ],
        }).compile();

        const app = module.createNestApplication();
        await app.init();
        gameHistoryService = module.get<GameHistoryService>(GameHistoryService);
        gameCardService = module.get<GameCardService>(GameCardService);
        connection = await module.get(getConnectionToken());

        gateway = module.get<ChatGateway>(ChatGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
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
            socket.emit.calledWith(CHAT_EVENTS.WordValidated, { isValidated: validWordCase.isValid, originalMessage: validWordCase.word }),
        ).toBeTruthy();
        gateway.validate(socket, invalidWordCase.word);
        expect(socket.emit.calledWith(CHAT_EVENTS.WordValidated, { isValidated: invalidWordCase.isValid, originalMessage: error })).toBeTruthy();
        gateway.validate(socket, emptyStringTestCase);
        expect(socket.emit.calledWith(CHAT_EVENTS.WordValidated, { isValidated: false, originalMessage: error })).toBeTruthy();
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
                expect(event).toEqual(CHAT_EVENTS.RoomMessage);
                expect(message.message).toEqual('X');
            },
        } as any);
        gateway.roomMessage(socket, { room: TEST_ROOM_ID, message: 'X' });
    });

    it('best time should add game history to mongoDB', async () => {
        socket.data.isSolo = true;
        const getGameCardSpy = jest.spyOn(gameCardService, 'getGameCardById').mockReturnValue(true);
        const addGameSpy = jest.spyOn(gameHistoryService, 'addGameToHistory').mockReturnValue(true);
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data) => {
                expect(event).toEqual(CHAT_EVENTS.RoomMessage);
                expect(data.event).toEqual('abandon');
                expect(data.socketId).toEqual(CHAT_EVENTS.Event);
                expect(data.message.includes(FAKE_GAME_HISTORY_DTO.gameMode));
            },
        } as any);
        await gateway.bestTime(socket, FAKE_GAME_HISTORY_DTO);
        expect(getGameCardSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_DTO.gameId);
        expect(socket.data.isSolo).toBe(false);
        expect(addGameSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_DTO);
    });

    it('event() should emit RoomMessage and return a string containing event and par when multiplayer', () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data) => {
                expect(event).toEqual(CHAT_EVENTS.RoomMessage);
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
                expect(event).toEqual(CHAT_EVENTS.RoomMessage);
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
                expect(event).toEqual(CHAT_EVENTS.RoomMessage);
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
                expect(event).toEqual(CHAT_EVENTS.Abandon);
                expect(data.event).toEqual('abandon');
                expect(data.socketId).toEqual('id');
            },
        } as any);
        gateway.handleDisconnect(socket);
    });

    it('socket disconnection should call best time in case of a solo game', () => {
        socket.data.isSolo = true;
        socket.data.soloGame = FAKE_GAME_HISTORY_DTO;
        const bestTimeSpy = jest.spyOn(gateway, 'bestTime').mockImplementation();
        gateway.handleDisconnect(socket);
        expect(bestTimeSpy).toHaveBeenCalledWith(socket, FAKE_GAME_HISTORY_DTO);
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

const FAKE_GAME_HISTORY_DTO: GameHistoryDTO = {
    gameId: 'test',
    gameName: 'game',
    gameMode: 'classique',
    gameDuration: 23,
    startTime: 'date',
    isMultiplayer: false,
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
