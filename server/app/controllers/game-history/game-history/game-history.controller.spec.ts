import { GameHistory, gameHistorySchema } from '@app/schemas/game-history';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { GameHistoryController } from './game-history.controller';

describe('GameHistoryController', () => {
    let controller: GameHistoryController;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        const module: TestingModule = await Test.createTestingModule({
            imports: [MongooseModule.forRoot(mongoUri), MongooseModule.forFeature([{ name: GameHistory.name, schema: gameHistorySchema }])],
            controllers: [GameHistoryController],
            providers: [GameHistoryService],
        }).compile();

        controller = module.get<GameHistoryController>(GameHistoryController);
        connection = await module.get(getConnectionToken());
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
        expect(controller).toBeDefined();
    });
});
