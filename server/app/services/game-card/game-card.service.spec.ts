/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { Differences, differencesSchema } from '@app/schemas/differences.schemas';
import { GameCard, GameCardDocument, gameCardSchema } from '@app/schemas/game-cards.schemas';
import { GameHistory, gameHistorySchema } from '@app/schemas/game-history';
import { Images, imagesSchema } from '@app/schemas/images.schema';
import { BestTimesService } from '@app/services/best-times/best-times.service';
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { DifferencesCounterService } from '@app/services/differences-counter/differences-counter.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { getFakeGameCard } from '@app/services/mock/fake-game-card';
import { PixelPositionService } from '@app/services/pixel-position/pixel-position/pixel-position.service';
import { PixelRadiusService } from '@app/services/pixel-radius/pixel-radius.service';
import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/tests/constants';
import { GameCardDto } from '@common/game-card.dto';
import { RankingBoard } from '@common/ranking-board';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
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
    let bestTimesService: BestTimesService;

    let FAKE_RANKING_BOARD: RankingBoard[];

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
                    { name: GameHistory.name, schema: gameHistorySchema },
                    { name: Images.name, schema: imagesSchema },
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
                BestTimesService,
                GameManagerService,
                GameHistoryService,
            ],
        }).compile();

        service = module.get<GameCardService>(GameCardService);
        bestTimesService = module.get<BestTimesService>(BestTimesService);
        gameCardModel = module.get<Model<GameCardDocument>>(getModelToken(GameCard.name));
        connection = await module.get(getConnectionToken());
        await gameCardModel.deleteMany({});

        FAKE_RANKING_BOARD = [
            {
                name: 'Yvon Gagné',
                time: 15,
            },
            {
                name: 'Pierre Laroche',
                time: 20,
            },
            {
                name: 'Jean Laporte',
                time: 25,
            },
        ];
    });

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

    it('deleteGameCard should call gameCardModel.findByIdAndDelete with a certain id', async () => {
        jest.spyOn(gameCardModel, 'findByIdAndDelete').mockImplementation();
        const id = new ObjectId(123);
        await service.deleteGameCard(id.toHexString());
        expect(gameCardModel.findByIdAndDelete).toBeCalledWith(id);
    });

    it('generateGameCard should create a game card from a game informations', async () => {
        const gameCard = getFakeGameCard();
        jest.spyOn(bestTimesService, 'generateBestTimes').mockImplementation(() => {
            return [
                { time: 0, name: '--' },
                { time: 0, name: '--' },
                { time: 0, name: '--' },
            ];
        });
        gameCard._id = new ObjectId('00000000773db8b853265f32');
        gameCard.name = 'game.name';
        expect(await service.createGameCard(FAKE_GAME_INFO)).toEqual(expect.objectContaining(gameCard));
    });

    it('updateGameCard should update a game card s best times in a solo game', async () => {
        const gameCard = getFakeGameCard();
        gameCard.soloTimes = FAKE_RANKING_BOARD;
        service.updateGameCard(gameCard, FAKE_PLAYER_BOARD, false);
        expect(gameCard.soloTimes[0]).toEqual(FAKE_PLAYER_BOARD);

        service.updateGameCard(gameCard, FAKE_SECOND_PLAYER_BOARD, false);
        expect(gameCard.soloTimes[1]).toEqual(FAKE_SECOND_PLAYER_BOARD);

        service.updateGameCard(gameCard, FAKE_THIRD_PLAYER_BOARD, false);
        expect(gameCard.soloTimes[2]).toEqual(FAKE_THIRD_PLAYER_BOARD);
    });

    it('updateGameCard should update a game card s best times in a multiplayer game', async () => {
        const gameCard = getFakeGameCard();
        gameCard.multiTimes = FAKE_RANKING_BOARD;
        service.updateGameCard(gameCard, FAKE_PLAYER_BOARD, true);
        expect(gameCard.multiTimes[0]).toEqual(FAKE_PLAYER_BOARD);

        service.updateGameCard(gameCard, FAKE_SECOND_PLAYER_BOARD, true);
        expect(gameCard.multiTimes[1]).toEqual(FAKE_SECOND_PLAYER_BOARD);

        service.updateGameCard(gameCard, FAKE_THIRD_PLAYER_BOARD, true);
        expect(gameCard.multiTimes[2]).toEqual(FAKE_THIRD_PLAYER_BOARD);
    });

    it('updateGameCard should not update a game card s best times in solo when player time is not in the top 3', async () => {
        const gameCard = getFakeGameCard();
        gameCard.soloTimes = FAKE_RANKING_BOARD;
        service.updateGameCard(gameCard, BAD_PLAYER_BOARD, false);
        expect(gameCard.soloTimes).toEqual(FAKE_RANKING_BOARD);
    });

    it('updateGameCard should not update a game card s best times in multiplayer when player time is not in the top 3', async () => {
        const gameCard = getFakeGameCard();
        gameCard.multiTimes = FAKE_RANKING_BOARD;
        service.updateGameCard(gameCard, BAD_PLAYER_BOARD, true);
        expect(gameCard.multiTimes).toEqual(FAKE_RANKING_BOARD);
    });
});

const FAKE_GAME_INFO: GameCardDto = {
    _id: '00000000773db8b853265f32',
    name: 'game.name',
    difficulty: 'Facile',
    radius: 3,
    differenceNumber: 6,
};

const FAKE_PLAYER_BOARD: RankingBoard = {
    name: 'Albert Einstein',
    time: 10,
};

const FAKE_SECOND_PLAYER_BOARD: RankingBoard = {
    name: 'second',
    time: 12,
};

const FAKE_THIRD_PLAYER_BOARD: RankingBoard = {
    name: 'third',
    time: 13,
};

const BAD_PLAYER_BOARD: RankingBoard = {
    name: 'Pierre Cayouette',
    time: 180,
};
