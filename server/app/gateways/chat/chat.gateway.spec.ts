/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { MatchGateway } from '@app/gateways/match/match.gateway';
import { StageWaitingRoomGateway } from '@app/gateways/waitingRoom/stage-waiting-room.gateway';
import { Differences, differencesSchema } from '@app/schemas/differences.schemas';
import { GameCard, gameCardSchema } from '@app/schemas/game-cards.schemas';
import { GameHistory, gameHistorySchema } from '@app/schemas/game-history';
import { Images, imagesSchema } from '@app/schemas/images.schema';
import { BestTimesService } from '@app/services/best-times/best-times.service';
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { DifferenceDetectionService } from '@app/services/difference-detection/difference-detection.service';
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameConstantService } from '@app/services/game-constant/game-constant.service';
import { GameDifficultyService } from '@app/services/game-difficulty/game-difficulty.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { getFakeGameCard } from '@app/services/mock/fake-game-card';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/tests/constants';
import { RoomMessage } from '@common/chat-gateway-constants';
import { CHAT_EVENTS } from '@common/chat-gateway-events';
import { FAKE_GAME_HISTORY, FAKE_GAME_HISTORY_MULTIPLAYER_SINGLE, FAKE_GAME_HISTORY_SINGLE } from '@common/mock/game-history-mock';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { Server, Socket } from 'socket.io';
describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let gameCard: GameCard;
    const TEST_ROOM_ID = 'test';
    let gameHistoryService: GameHistoryService;
    let gameCardService: GameCardService;

    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        gameCard = getFakeGameCard();

        gameCard.multiTimes = rankings.multiTimes;
        gameCard.soloTimes = rankings.soloTimes;

        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        socket.data = {};
        socket.data.room = TEST_ROOM_ID;
        Object.defineProperty(socket, 'id', { value: 'id' });
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(mongoUri),
                MongooseModule.forFeature([{ name: GameCard.name, schema: gameCardSchema }]),
                MongooseModule.forFeature([{ name: GameHistory.name, schema: gameHistorySchema }]),
                MongooseModule.forFeature([{ name: Differences.name, schema: differencesSchema }]),
                MongooseModule.forFeature([{ name: Images.name, schema: imagesSchema }]),
            ],
            providers: [
                ChatGateway,
                StageWaitingRoomGateway,
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

    it('roomMessage() should send message if socket in the room', () => {
        server.to.returns({
            emit: (event: string, message: RoomMessage) => {
                expect(event).toEqual(CHAT_EVENTS.RoomMessage);
                expect(message.message).toEqual('X');
            },
        } as any);
        gateway.roomMessage(socket, 'X');
    });

    it('best time should add game history to mongoDB', async () => {
        socket.data.isSolo = true;
        const getGameCardSpy = jest.spyOn(gameCardService, 'getGameCardById').mockResolvedValue(gameCard);
        const addGameSpy = jest.spyOn(gameHistoryService, 'addGameToHistory').mockImplementation();
        jest.spyOn(gameCardService, 'updateGameCard').mockResolvedValue(gameCard);
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        const sendSpy = jest.spyOn(server, 'emit');
        server.to.returns({
            emit: (event: string, data: RoomMessage) => {
                expect(event).toEqual(CHAT_EVENTS.RoomMessage);
                expect(data.event).toEqual('abandon');
                expect(data.socketId).toEqual(CHAT_EVENTS.Event);
                expect(data.message.includes(FAKE_GAME_HISTORY[0].gameMode)).toBeTruthy();
                expect(data.message.includes('solo')).toBeTruthy();
            },
        } as any);
        await gateway.endGameEvents(socket, FAKE_GAME_HISTORY_SINGLE);
        expect(getGameCardSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_SINGLE.gameId);
        expect(socket.data.isSolo).toBe(false);
        expect(addGameSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_SINGLE);
        expect(sendSpy).toHaveBeenCalled();
    });

    it('best time should properly select the winner name and not send if undefined ', async () => {
        const getGameCardSpy = jest.spyOn(gameCardService, 'getGameCardById').mockResolvedValue(gameCard);
        const addGameSpy = jest.spyOn(gameHistoryService, 'addGameToHistory').mockImplementation();
        jest.spyOn(gameCardService, 'updateGameCard').mockResolvedValue(gameCard);
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        const sendSpy = jest.spyOn(server, 'emit');
        server.to.returns({
            emit: (event: string, data: RoomMessage) => {
                expect(event).toEqual(CHAT_EVENTS.RoomMessage);
                expect(data.event).toEqual('abandon');
                expect(data.socketId).toEqual(CHAT_EVENTS.Event);
                expect(data.message.includes(FAKE_GAME_HISTORY[0].gameMode)).toBeTruthy();
                expect(data.message.includes('solo')).toBeTruthy();
            },
        } as any);
        FAKE_GAME_HISTORY_SINGLE.player1.hasWon = false;
        await gateway.endGameEvents(socket, FAKE_GAME_HISTORY_SINGLE);
        expect(getGameCardSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_SINGLE.gameId);
        expect(socket.data.isSolo).toBe(false);
        expect(addGameSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_SINGLE);
        expect(sendSpy).not.toHaveBeenCalled();
    });

    it('best time should properly assign player name', async () => {
        jest.spyOn(gameCardService, 'getGameCardById').mockResolvedValue(gameCard);
        jest.spyOn(gameHistoryService, 'addGameToHistory').mockImplementation();
        jest.spyOn(gameCardService, 'updateGameCard').mockResolvedValue(gameCard);
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        jest.spyOn(server, 'emit');
        server.to.returns({
            emit: (event: string, data: RoomMessage) => {
                expect(event).toEqual(CHAT_EVENTS.RoomMessage);
                expect(data.message.includes(FAKE_GAME_HISTORY_MULTIPLAYER_SINGLE.gameMode)).toBeTruthy();
                expect(data.message.includes('string')).toBeTruthy();
            },
        } as any);
        gateway.endGameEvents(socket, FAKE_GAME_HISTORY_MULTIPLAYER_SINGLE);
    });

    it('best time should include choose correct ranking', async () => {
        FAKE_GAME_HISTORY_SINGLE.isMultiplayer = false;
        jest.spyOn(gameCardService, 'getGameCardById').mockResolvedValue(gameCard);
        jest.spyOn(gameHistoryService, 'addGameToHistory').mockImplementation();
        jest.spyOn(gameCardService, 'updateGameCard').mockResolvedValue(gameCard);
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        jest.spyOn(server, 'emit');
        server.to.returns({
            emit: (event: string, data: RoomMessage) => {
                expect(event).toEqual(CHAT_EVENTS.RoomMessage);
                expect(data.message.includes(FAKE_GAME_HISTORY_MULTIPLAYER_SINGLE.gameMode)).toBeTruthy();
                expect(data.message.includes('string')).toBeTruthy();
                expect(data.message.includes('solo')).toBeTruthy();
            },
        } as any);
        gateway.endGameEvents(socket, FAKE_GAME_HISTORY_SINGLE);
        FAKE_GAME_HISTORY_SINGLE.isMultiplayer = true;
    });

    it('best time message should include multiplayer depending on multiplayer mode', async () => {
        socket.data.isSolo = true;
        FAKE_GAME_HISTORY_SINGLE.player1.hasWon = true;
        FAKE_GAME_HISTORY_SINGLE.isMultiplayer = false;
        const getGameCardSpy = jest.spyOn(gameCardService, 'getGameCardById').mockResolvedValue(gameCard);
        const addGameSpy = jest.spyOn(gameHistoryService, 'addGameToHistory').mockImplementation();
        const updateTimeSpy = jest.spyOn(gameCardService, 'updateGameCard').mockResolvedValue(gameCard);
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        const sendSpy = jest.spyOn(server, 'emit');
        server.to.returns({
            emit: (event: string, data: RoomMessage) => {
                expect(event).toEqual(CHAT_EVENTS.RoomMessage);
                expect(data.event).toEqual('abandon');
                expect(data.socketId).toEqual(CHAT_EVENTS.Event);
                expect(data.message.includes(FAKE_GAME_HISTORY_SINGLE.gameMode)).toBeTruthy();
                expect(data.message.includes('multiplayer')).toBeTruthy();
                expect(data.message.includes('string')).toBeTruthy();
                expect(data.message.includes('2')).toBeTruthy();
            },
        } as any);
        await gateway.endGameEvents(socket, FAKE_GAME_HISTORY_SINGLE);
        expect(getGameCardSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_SINGLE.gameId);
        expect(socket.data.isSolo).toBe(false);
        expect(addGameSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_SINGLE);
        expect(sendSpy).toHaveBeenCalled();
        expect(updateTimeSpy).toHaveBeenCalled();
    });

    it('best time message should include solo on solo mode', async () => {
        const getGameCardSpy = jest.spyOn(gameCardService, 'getGameCardById').mockResolvedValue(gameCard);
        const addGameSpy = jest.spyOn(gameHistoryService, 'addGameToHistory').mockImplementation();
        const updateTimeSpy = jest.spyOn(gameCardService, 'updateGameCard').mockResolvedValue(gameCard);
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        const sendSpy = jest.spyOn(server, 'emit');
        server.to.returns({
            emit: (event: string, data: RoomMessage) => {
                expect(event).toEqual(CHAT_EVENTS.RoomMessage);
                expect(data.event).toEqual('abandon');
                expect(data.socketId).toEqual(CHAT_EVENTS.Event);
                expect(data.message.includes(FAKE_GAME_HISTORY_SINGLE.gameMode)).toBeTruthy();
                expect(data.message.includes('solo')).toBeTruthy();
                expect(data.message.includes('string')).toBeTruthy();
                expect(data.message.includes('2')).toBeTruthy();
            },
        } as any);
        await gateway.endGameEvents(socket, FAKE_GAME_HISTORY_SINGLE);
        expect(getGameCardSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_SINGLE.gameId);
        expect(addGameSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_SINGLE);
        expect(sendSpy).toHaveBeenCalled();
        expect(updateTimeSpy).toHaveBeenCalled();
    });

    it('best time should ignore the emit to chat if a player has abandoned the game', async () => {
        socket.data.isSolo = true;
        FAKE_GAME_HISTORY_SINGLE.player1.hasAbandon = true;
        FAKE_GAME_HISTORY_SINGLE.player2 = {
            name: 'loser',
            hasAbandon: false,
            hasWon: false,
        };
        FAKE_GAME_HISTORY_SINGLE.player2.hasAbandon = false;
        const getGameCardSpy = jest.spyOn(gameCardService, 'getGameCardById').mockResolvedValue(gameCard);
        const addGameSpy = jest.spyOn(gameHistoryService, 'addGameToHistory').mockImplementation();
        jest.spyOn(gameCardService, 'updateGameCard').mockResolvedValue(gameCard);
        const sendSpy = jest.spyOn(server, 'emit');
        await gateway.endGameEvents(socket, FAKE_GAME_HISTORY_SINGLE);
        expect(getGameCardSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_SINGLE.gameId);
        expect(socket.data.isSolo).toBe(false);
        expect(addGameSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_SINGLE);
        expect(sendSpy).not.toHaveBeenCalled();

        FAKE_GAME_HISTORY_SINGLE.player1.hasAbandon = false;
        FAKE_GAME_HISTORY_SINGLE.player2 = {
            name: 'loser',
            hasAbandon: false,
            hasWon: false,
        };

        FAKE_GAME_HISTORY_SINGLE.player2.hasAbandon = true;
        await gateway.endGameEvents(socket, FAKE_GAME_HISTORY_SINGLE);
        expect(getGameCardSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_SINGLE.gameId);
        expect(socket.data.isSolo).toBe(false);
        expect(addGameSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_SINGLE);
        expect(sendSpy).not.toHaveBeenCalled();

        FAKE_GAME_HISTORY_SINGLE.player1.hasAbandon = true;
        await gateway.endGameEvents(socket, FAKE_GAME_HISTORY_SINGLE);
        expect(getGameCardSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_SINGLE.gameId);
        expect(socket.data.isSolo).toBe(false);
        expect(addGameSpy).toHaveBeenCalledWith(FAKE_GAME_HISTORY_SINGLE);
        expect(sendSpy).not.toHaveBeenCalled();
    });

    it('event() should emit RoomMessage and return a string containing event and par when multiplayer', () => {
        server.to.returns({
            emit: (event: string, data: RoomMessage) => {
                expect(event).toEqual(CHAT_EVENTS.RoomMessage);
                expect(data.message.includes('Error')).toBe(true);
                expect(data.message.includes('par')).toBe(true);
            },
        } as any);
        gateway.event(socket, { event: 'Error', isMultiplayer: true });
        expect(server.to.calledWith(TEST_ROOM_ID)).toBeTruthy();
    });

    it('event() should emit RoomMessage and return a string containing event without par', () => {
        server.to.returns({
            emit: (event: string, data: RoomMessage) => {
                expect(event).toEqual(CHAT_EVENTS.RoomMessage);
                expect(data.message.includes('Différence')).toBe(true);
                expect(data.message.includes('par')).toBe(false);
            },
        } as any);
        gateway.event(socket, { event: 'Différence', isMultiplayer: false });
        expect(server.to.calledWith(TEST_ROOM_ID)).toBeTruthy();
    });

    it('hint should emit RoomMessage event and include a socketid called Event', () => {
        server.to.returns({
            emit: (event: string, data: RoomMessage) => {
                expect(event).toEqual(CHAT_EVENTS.RoomMessage);
                expect(data.message.includes('Indice')).toBe(true);
                expect(data.socketId).toEqual('event');
            },
        } as any);
        gateway.hint(socket);
        expect(server.to.calledWith(TEST_ROOM_ID)).toBeTruthy();
    });

    it('socket disconnection should emit a disconnect to rooms', () => {
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data: RoomMessage) => {
                expect(event).toEqual(CHAT_EVENTS.Abandon);
                expect(data.event).toEqual('notification');
                expect(data.socketId).toEqual('id');
            },
        } as any);
        gateway.handleDisconnect(socket);
    });

    it('socket disconnection should call best time in case of a solo game', () => {
        socket.data.room = undefined;
        socket.data.isSolo = true;
        socket.data.soloGame = FAKE_GAME_HISTORY_SINGLE;
        const bestTimeSpy = jest.spyOn(gateway, 'endGameEvents').mockImplementation();
        gateway.handleDisconnect(socket);
        expect(bestTimeSpy).toHaveBeenCalledWith(socket, FAKE_GAME_HISTORY_SINGLE);
    });

    it('dateCreator should return current time', () => {
        const date = new Date();
        const hour = date.getHours().toString();
        const minutes = date.getMinutes().toString();
        const expectedDate = gateway.dateCreator();
        expect(expectedDate.includes(hour)).toBe(true);
        expect(expectedDate.includes(minutes)).toBe(true);
    });

    it('limitedEndGame should calculate time duration of limited game and call addGameTimeHistory ', () => {
        const addGameTimeHistorySpy = jest.spyOn(gameHistoryService, 'addGameToHistory').mockImplementation();
        gateway.limitedEndGame(socket, FAKE_GAME_HISTORY_SINGLE);
        expect(addGameTimeHistorySpy).toHaveBeenCalled();
    });

    it('handleDisconnect should add gameTimeHistory in solo mode', () => {
        socket.data.isLimitedSolo = true;
        socket.data.limitedHistory = FAKE_GAME_HISTORY_SINGLE;
        stub(socket, 'rooms').value(new Set([TEST_ROOM_ID]));
        server.to.returns({
            emit: (event: string, data: RoomMessage) => {
                expect(event).toEqual(CHAT_EVENTS.Abandon);
                expect(data.event).toEqual('notification');
                expect(data.socketId).toEqual('id');
            },
        } as any);
        const addGameTimeHistorySpy = jest.spyOn(gameHistoryService, 'addGameToHistory').mockImplementation();
        gateway.handleDisconnect(socket);
        expect(addGameTimeHistorySpy).toHaveBeenCalled();
    });

    it('updateBestTime should update the game card', async () => {
        const updateGameCardSpy = jest.spyOn(gameCardService, 'updateGameCard').mockImplementation();
        jest.spyOn(gameCardService, 'getGameCardById').mockResolvedValue(gameCard);
        const gameHistory = FAKE_GAME_HISTORY_MULTIPLAYER_SINGLE;
        gameHistory.player1.hasWon = false;
        await gateway.updateBestTime(gameHistory);
        expect(updateGameCardSpy).toHaveBeenCalled();
    });

    it('broadcastNewBestTime should send broadcast to all sockets of new best time', () => {
        const gameHistory = FAKE_GAME_HISTORY_MULTIPLAYER_SINGLE;
        gameHistory.player1.hasWon = false;
        const emitSpy = jest.spyOn(server, 'emit').mockImplementation();
        gateway.broadcastNewBestTime(gameHistory, gameCard);
        expect(emitSpy).toHaveBeenCalled();
    });
});

export const rankings = {
    multiTimes: [
        { name: 'test', time: 3 },
        { name: 'string', time: 4 },
    ],
    soloTimes: [
        { name: 'test', time: 3 },
        { name: 'string', time: 4 },
    ],
};
