import { Differences, differencesSchema } from '@app/schemas/differences.schemas';
import { GameHistory, gameHistorySchema } from '@app/schemas/game-history';
import { Images, imagesSchema } from '@app/schemas/images.schema';
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/tests/constants';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameManagerService } from './game-manager.service';

describe('GameManagerService', () => {
    let service: GameManagerService;
    let gameCardService: SinonStubbedInstance<GameCardService>;
    const id = '63fe6fb0b9546f9126a1811e';

    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        gameCardService = createStubInstance<GameCardService>(GameCardService);

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
                MongooseModule.forFeature([{ name: Images.name, schema: imagesSchema }]),
            ],
            providers: [
                GameManagerService,
                DifferenceClickService,
                DifferencesCounterService,
                ImageDimensionsService,
                PixelRadiusService,
                PixelPositionService,
                { provide: GameCardService, useValue: gameCardService },
                GameHistoryService,
                ImageManagerService,
            ],
        }).compile();

        service = module.get<GameManagerService>(GameManagerService);
        connection = await module.get(getConnectionToken());
    });

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
        jest.spyOn(service, 'deleteFromMongo').mockImplementation();
        service.addGame(id, 1);
        await service.deleteGameFromDb(id);
        await service.endGame(id);
        expect(service.deleteFromMongo).toBeCalled();
        expect(deleteMock).toBeCalledWith(id);
        expect(deleteMock).toBeCalledTimes(1);
    });

    it('endGame should decrease the amount of game being played otherwise', async () => {
        const numberOfPlayer = 5;
        service.addGame(id, numberOfPlayer);

        await service.deleteGameFromDb(id);
        await service.endGame(id);
        expect(service.gamePlayedInformation.get(id).numberOfPlayers).toBe(numberOfPlayer - 1);
    });

    it('addGame should increase the amount of game being played if the game exists', async () => {
        const numberOfPlayer = 5;
        service.addGame(id, numberOfPlayer);
        service.addGame(id, 1);
        expect(service.gamePlayedInformation.get(id).numberOfPlayers).toBe(numberOfPlayer + 1);
    });

    it('deleteGameFromDb should delete the game if no one is playing it', async () => {
        jest.spyOn(service, 'deleteFromMongo').mockImplementation();
        await service.deleteGameFromDb(id);
        expect(service.deleteFromMongo).toBeCalledWith(id);
    });

    it('deleteGameFromDb should set the isDeleted property of the game to true if someone is playing it', async () => {
        service.addGame(id, 1);
        expect(service.gamePlayedInformation.get(id).isDeleted).toBe(false);
        await service.deleteGameFromDb(id);
        expect(service.gamePlayedInformation.get(id).isDeleted).toBe(true);
    });
});
