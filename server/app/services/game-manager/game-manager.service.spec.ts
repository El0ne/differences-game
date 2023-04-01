import { Differences, differencesSchema } from '@app/schemas/differences.schemas';
import { GameHistory, gameHistorySchema } from '@app/schemas/game-history';
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { GameManagerService } from './game-manager.service';

describe('GameManagerService', () => {
    let service: GameManagerService;
    let differenceClickService;
    let gameHistoryService;
    const id = '63fe6fb0b9546f9126a1811e';

    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Differences.name, schema: differencesSchema }]),
                MongooseModule.forFeature([{ name: GameHistory.name, schema: gameHistorySchema }]),
            ],
            providers: [
                GameManagerService,
                DifferenceClickService,
                DifferencesCounterService,
                ImageDimensionsService,
                PixelRadiusService,
                PixelPositionService,
                GameHistoryService,
            ],
        }).compile();

        service = module.get<GameManagerService>(GameManagerService);
        differenceClickService = module.get<DifferenceClickService>(DifferenceClickService);
        gameHistoryService = module.get<GameHistoryService>(GameHistoryService);
        connection = await module.get(getConnectionToken());
    });

    const DELAY_BEFORE_CLOSING_CONNECTION = 200;

    afterEach((done) => {
        setTimeout(async () => {
            await mongoServer.stop();
            await connection.close();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('endGame should call .delete and .deleteDifferences if it is the last game ending and the game has to be deleted', async () => {
        const deleteMock = jest.spyOn(service.gamePlayedInformation, 'delete');
        const deleteDifferencesMock = jest.spyOn(differenceClickService, 'deleteDifferences');

        service.addGame(id, 1);
        await service.deleteGame(id);
        await service.endGame(id);
        expect(deleteMock).toBeCalledWith(id);
        expect(deleteMock).toBeCalledTimes(1);
        expect(deleteDifferencesMock).toBeCalledWith(id);
        expect(deleteDifferencesMock).toBeCalledTimes(1);
    });

    it('endGame should decrease the amount of game being played otherwise', async () => {
        const numberOfPlayer = 5;
        service.addGame(id, numberOfPlayer);

        await service.deleteGame(id);
        await service.endGame(id);
        expect(service.gamePlayedInformation.get(id).numberOfPlayers).toBe(numberOfPlayer - 1);
    });

    it('addGame should increase the amount of game being played if the game exists', async () => {
        const numberOfPlayer = 5;
        service.addGame(id, numberOfPlayer);
        service.addGame(id, 1);
        expect(service.gamePlayedInformation.get(id).numberOfPlayers).toBe(numberOfPlayer + 1);
    });

    it('deleteGame should delete the game if no one is playing it', async () => {
        const deleteDifferenceMock = jest.spyOn(differenceClickService, 'deleteDifferences');
        const deleteGameHistoryMock = jest.spyOn(gameHistoryService, 'deleteGameHistory');
        await service.deleteGame(id);
        expect(deleteDifferenceMock).toBeCalledWith(id);
        expect(deleteGameHistoryMock).toBeCalledWith(id);
    });

    it('deleteGame should set the isDeleted property of the game to true if someone is playing it', async () => {
        service.addGame(id, 1);
        expect(service.gamePlayedInformation.get(id).isDeleted).toBe(false);
        await service.deleteGame(id);
        expect(service.gamePlayedInformation.get(id).isDeleted).toBe(true);
    });
});
