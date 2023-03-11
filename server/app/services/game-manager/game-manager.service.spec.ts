import { Differences, differencesSchema } from '@app/schemas/differences.schemas';
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
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
            ],
            providers: [
                GameManagerService,
                DifferenceClickService,
                DifferencesCounterService,
                ImageDimensionsService,
                PixelRadiusService,
                PixelPositionService,
            ],
        }).compile();

        service = module.get<GameManagerService>(GameManagerService);
        differenceClickService = module.get<DifferenceClickService>(DifferenceClickService);
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

    it('createGame should add the id to the gamePlayedInformation map', () => {
        const mapSetMock = jest.spyOn(service.gamePlayedInformation, 'set');
        const FAKE_MAP_GAME_INFO = { isDeleted: false, numberOfGames: 0 };
        service.createGame(id);
        expect(mapSetMock).toBeCalledWith(id, FAKE_MAP_GAME_INFO);
        expect(mapSetMock).toBeCalledTimes(1);
    });

    it('endGame should call .delete and .deleteDifferences if it is the last game ending and the game has to be deleted', async () => {
        const deleteMock = jest.spyOn(service.gamePlayedInformation, 'delete');
        const deleteDifferencesMock = jest.spyOn(differenceClickService, 'deleteDifferences');

        service.createGame(id);
        service.addGame(id);
        await service.deleteGame(id);
        await service.endGame(id);
        expect(deleteMock).toBeCalledWith(id);
        expect(deleteMock).toBeCalledTimes(1);
        expect(deleteDifferencesMock).toBeCalledWith(id);
        expect(deleteDifferencesMock).toBeCalledTimes(1);
    });

    it('endGame should decrease the amount of game being played otherwise', async () => {
        const gameAmount = 5;
        service.createGame(id);
        for (let i = 0; i < gameAmount; i++) {
            service.addGame(id);
        }
        await service.deleteGame(id);
        await service.endGame(id);
        expect(service.gamePlayedInformation.get(id).numberOfGames).toBe(gameAmount - 1);
    });

    it('addGame should increase the amount of game being played if the game exists', async () => {
        const gameAmount = 5;
        service.createGame(id);
        for (let i = 0; i < gameAmount; i++) {
            service.addGame(id);
        }
        await service.addGame(id);
        expect(service.gamePlayedInformation.get(id).numberOfGames).toBe(gameAmount + 1);
    });

    it('deleteGame should delete the game if no one is playing it', async () => {
        const mapDeleteMock = jest.spyOn(service.gamePlayedInformation, 'delete');
        const deleteDifferenceMock = jest.spyOn(differenceClickService, 'deleteDifferences');
        service.createGame(id);
        await service.deleteGame(id);

        expect(mapDeleteMock).toBeCalledWith(id);
        expect(deleteDifferenceMock).toBeCalledWith(id);
        expect(mapDeleteMock).toBeCalledTimes(1);
    });

    it('deleteGame should set the isDeleted property of the game to true if someone is playing it', async () => {
        service.createGame(id);
        await service.addGame(id);

        // Mock created after first function calls because set is called in them
        const mapSetMock = jest.spyOn(service.gamePlayedInformation, 'set');

        await service.deleteGame(id);

        expect(mapSetMock).toBeCalledWith(id, { isDeleted: true, numberOfGames: 1 });
        expect(mapSetMock).toBeCalledTimes(1);
    });
});
