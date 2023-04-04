/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-underscore-dangle */
import { GameCard, GameCardDocument, gameCardSchema } from '@app/schemas/game-cards.schemas';
import { getFakeGameCard } from '@app/services/mock/fake-game-card';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, Query } from 'mongoose';
import { BestTimesService, GENERATED_NAME_LENGTH, MINIMUM_GENERATED_TIME, TIME_MULTIPLIER } from './best-times.service';

describe('BestTimesService', () => {
    let service: BestTimesService;
    let gameCardModel: Model<GameCardDocument>;
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
                MongooseModule.forFeature([{ name: GameCard.name, schema: gameCardSchema }]),
            ],
            providers: [BestTimesService],
        }).compile();

        service = module.get<BestTimesService>(BestTimesService);
        gameCardModel = module.get<Model<GameCardDocument>>(getModelToken(GameCard.name));
        connection = await module.get(getConnectionToken());
        await gameCardModel.deleteMany({});
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
        expect(gameCardModel).toBeDefined();
    });

    it('resetAllGameCards should reset the bestTimes of all the gameCards', async () => {
        const fakeGameCardArray: GameCard[] = [];

        jest.spyOn(service, 'resetBestTimes').mockImplementation();

        for (let i = 0; i < 5; i++) {
            fakeGameCardArray.push(getFakeGameCard());
        }
        jest.spyOn(gameCardModel, 'find').mockReturnValueOnce(
            Promise.resolve(fakeGameCardArray) as unknown as Query<unknown[] | null, GameCardDocument>,
        );
        await service.resetAllBestTimes();

        expect(gameCardModel.find).toBeCalled();
        expect(service.resetBestTimes).toBeCalledTimes(fakeGameCardArray.length);
    });

    it('resetBestTimes should reset a game card best times', async () => {
        const gameCard = getFakeGameCard();
        await gameCardModel.create(gameCard);
        const soloTimes = gameCard.soloTimes;
        const multiTimes = gameCard.multiTimes;

        await service.resetBestTimes(gameCard._id.toHexString());

        const updatedGameCard = await gameCardModel.findById(gameCard._id);

        expect(soloTimes).not.toEqual(updatedGameCard.soloTimes);
        expect(multiTimes).not.toEqual(updatedGameCard.multiTimes);
    });

    it('generateBestTimes should should generate a ranking board array sorted by shortest to longest time', async () => {
        jest.spyOn(service, 'generateBestTime');

        const newBestTimes = service.generateBestTimes();

        expect(service.generateBestTime).toBeCalledTimes(3);
        expect(newBestTimes[0].time <= newBestTimes[1].time).toBeTruthy();
        expect(newBestTimes[1].time <= newBestTimes[2].time).toBeTruthy();
    });

    it('generateBestTime should generate a random number between max an min and generate a random name', async () => {
        jest.spyOn(service, 'generateRandomName');

        const rankingBoard = service.generateBestTime();

        expect(service.generateRandomName).toBeCalled();
        expect(rankingBoard.time).toBeGreaterThanOrEqual(MINIMUM_GENERATED_TIME);
        expect(rankingBoard.time).toBeLessThanOrEqual(TIME_MULTIPLIER + MINIMUM_GENERATED_TIME);
    });

    it('generateRandomName should generate a random name of a certain length', async () => {
        const name = service.generateRandomName();
        const otherName = service.generateRandomName();

        expect(name.length).toEqual(GENERATED_NAME_LENGTH);
        expect(name).not.toEqual(otherName);
    });
});
