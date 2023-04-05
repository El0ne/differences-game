import { GameHistory, GameHistoryDocument, gameHistorySchema } from '@app/schemas/game-history';
import { getFakeGameHistoryElement } from '@common/mock/game-history-mock';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { GameHistoryService } from './game-history.service';

describe('GameHistoryService', () => {
    let service: GameHistoryService;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;
    let gameHistoryModel: Model<GameHistoryDocument>;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: GameHistory.name, schema: gameHistorySchema }]),
            ],
            providers: [GameHistoryService],
        }).compile();

        service = module.get<GameHistoryService>(GameHistoryService);
        gameHistoryModel = module.get<Model<GameHistoryDocument>>(getModelToken(GameHistory.name));
        connection = await module.get(getConnectionToken());
        await gameHistoryModel.deleteMany({});
    });

    const DELAY_BEFORE_CLOSING_CONNECTION = 200;

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(gameHistoryModel).toBeDefined();
    });

    it('getGameHistory should return all the game history', async () => {
        expect((await service.getGameHistory()).length).toEqual(0);
        const gameHistory = getFakeGameHistoryElement();
        await gameHistoryModel.create(gameHistory);
        expect((await service.getGameHistory()).length).toEqual(1);
        expect(await service.getGameHistory()).toEqual([expect.objectContaining(gameHistory)]);
    });

    it('addGameToHistory should add a game history object to the game history', async () => {
        expect((await service.getGameHistory()).length).toEqual(0);
        const gameHistory = getFakeGameHistoryElement();
        await service.addGameToHistory(gameHistory);
        expect((await service.getGameHistory()).length).toEqual(1);
        expect(await service.getGameHistory()).toEqual([expect.objectContaining(gameHistory)]);
    });

    it('deleteAllGameHistory should add a game history object to the game history', async () => {
        expect((await service.getGameHistory()).length).toEqual(0);

        const gameHistory = getFakeGameHistoryElement();
        const gameNumber = 5;
        for (let i = 0; i < gameNumber; i++) {
            await service.addGameToHistory(gameHistory);
        }

        expect((await service.getGameHistory()).length).toEqual(gameNumber);

        await service.deleteAllGameHistory();

        expect((await service.getGameHistory()).length).toEqual(0);
    });
});
