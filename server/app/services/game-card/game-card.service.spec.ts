/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { Differences, differencesSchema } from '@app/schemas/differences.schemas';
import { GameCard, GameCardDocument, gameCardSchema } from '@app/schemas/game-cards.schemas';
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { GameCardDto } from '@common/game-card.dto';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing/test';
import { ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { stub } from 'sinon';
import { GameCardService } from './game-card.service';

describe('GameCardService', () => {
    let service: GameCardService;
    let gameCardModel: Model<GameCardDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;
    let imageManagerService: ImageManagerService;
    let differenceClickService: DifferenceClickService;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([
                    { name: GameCard.name, schema: gameCardSchema },
                    { name: Differences.name, schema: differencesSchema },
                ]),
            ],
            providers: [
                GameCardService,
                DifferenceClickService,
                ImageManagerService,
                DifferencesCounterService,
                ImageDimensionsService,
                PixelRadiusService,
                PixelPositionService,
            ],
        }).compile();

        service = module.get<GameCardService>(GameCardService);
        imageManagerService = module.get<ImageManagerService>(ImageManagerService);
        differenceClickService = module.get<DifferenceClickService>(DifferenceClickService);
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

    it('getAllGameCards should return all gameCards informations', async () => {
        expect((await service.getAllGameCards()).length).toEqual(0);
        const gameCard = getFakeGameCard();
        await gameCardModel.create(gameCard);
        expect((await service.getAllGameCards()).length).toEqual(1);
        expect(await service.getAllGameCards()).toEqual([expect.objectContaining(gameCard)]);
    });

    it('getGameCards should return all gameCards informations between both indexes', async () => {
        const startIndex = 0;
        const endIndex = 2;
        const answer = [];
        for (let i = 0; i < endIndex; i++) {
            const game = getFakeGameCard();
            await gameCardModel.create(game);
            answer.push(game);
        }
        const gameCards = await service.getGameCards(startIndex, endIndex);
        for (let i = 0; i < endIndex; i++) {
            expect(gameCards[i]).toEqual(expect.objectContaining(answer[i]));
        }
    });

    it('getGameCardById should return a specific game card', async () => {
        const game = getFakeGameCard();
        await gameCardModel.create(game);
        const id = game._id;
        const gameCard = await service.getGameCardById(id.toHexString());
        expect(gameCard).toEqual(expect.objectContaining(game));
    });

    it('getGameCardsNumber should return the number of gameCards informations we have', async () => {
        const gameAmount = 2;
        for (let i = 0; i < gameAmount; i++) {
            const game = getFakeGameCard();
            await gameCardModel.create(game);
        }
        const gameCardsNumber = await service.getGameCardsNumber();
        expect(gameCardsNumber).toEqual(gameAmount);
    });

    it('createGameCard should add a game card to the list of game cards', async () => {
        const fakeGameCard = getFakeGameCard();
        stub(service, 'generateGameCard').callsFake(() => fakeGameCard);
        await service.createGameCard(FAKE_GAME_INFO);
        const game = await service.getGameCardById(fakeGameCard._id.toHexString());
        expect(game).toEqual(expect.objectContaining(fakeGameCard));
    });

    it('deleteGameCard should delete a gameCard, its 2 images and call the deleteDifferences service', async () => {
        const gameCard = getFakeGameCard();
        const imageManagerServiceMock = jest.spyOn(imageManagerService, 'deleteImage').mockImplementation();

        await gameCardModel.create(gameCard);

        await service.deleteGameCard(gameCard._id.toHexString());

        expect(imageManagerServiceMock).toHaveBeenCalledWith(gameCard.originalImageName);
        expect(imageManagerServiceMock).toHaveBeenCalledWith(gameCard.differenceImageName);
    });
    it('generateGameCard should create a game card from a game informations', async () => {
        const gameCard = getFakeGameCard();
        gameCard._id = new ObjectId('00000000773db8b853265f32');
        gameCard.name = 'game.name';
        expect(await service.createGameCard(FAKE_GAME_INFO)).toEqual(expect.objectContaining(gameCard));
    });
});

const FAKE_GAME_INFO: GameCardDto = {
    _id: '00000000773db8b853265f32',
    name: 'game.name',
    difficulty: 'Facile',
    baseImage: 'game.baseImage',
    differenceImage: 'game.differenceImage',
    radius: 3,
    differenceNumber: 6,
};

const getFakeGameCard = (): GameCard => ({
    _id: new ObjectId(),
    name: (Math.random() + 1).toString(36).substring(2),
    difficulty: 'Facile',
    differenceNumber: 6,
    originalImageName: 'game.baseImage',
    differenceImageName: 'game.differenceImage',
    soloTimes: [
        { time: 0, name: '--' },
        { time: 0, name: '--' },
        { time: 0, name: '--' },
    ],
    multiTimes: [
        { time: 0, name: '--' },
        { time: 0, name: '--' },
        { time: 0, name: '--' },
    ],
});
