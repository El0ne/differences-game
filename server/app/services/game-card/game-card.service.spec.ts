/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import { GameCard, GameCardDocument, gameCardSchema } from '@app/schemas/game-cards.schemas';
import { GameCardDto } from '@common/game-card.dto';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing/test';
import { ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { GameCardService } from './game-card.service';
import { gameCardsInformations } from './game-cards-test.json';

describe('GameCardService', () => {
    let service: GameCardService;
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
            providers: [GameCardService],
        }).compile();

        service = module.get<GameCardService>(GameCardService);
        gameCardModel = module.get<Model<GameCardDocument>>(getModelToken(GameCard.name));
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
        expect(service).toBeDefined();
        expect(gameCardModel).toBeDefined();
    });

    it('getAllGameCards should return all gameCards informations', async () => {
        await gameCardModel.deleteMany({});
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
            // console.log('game', game);
            answer.push(game);
        }
        // answer.push(FAKE_GAME_CARD);
        const gameCards = await service.getGameCards(startIndex, endIndex);
        // console.log('gameCards', gameCards);
        // console.log('answer', answer);
        for (let i = 0; i < endIndex; i++) {
            expect(gameCards[i]).toEqual(expect.objectContaining(answer[i]));
        }
    });

    it('getGameCardById should return a specific game card', async () => {
        const gameCard = service.getGameCardById('0123');
        expect(gameCard).toEqual(gameCardsInformations.find((card) => (card.id = '0123')));
    });

    it('getGameCardsNumber should return the number of gameCards informations we have', async () => {
        const gameCardsNumber = service.getGameCardsNumber();
        expect(gameCardsNumber).toEqual(gameCardsInformations.length);
    });

    //     it('createGameCard should add a game card to the list of game cards', () => {
    //         stub(service, 'generateGameCard').callsFake(() => FAKE_GAME_CARD);
    //         service.createGameCard(FAKE_GAME_INFO);
    //         const allGameCards = service.getAllGameCards();
    //         expect(allGameCards).toContainEqual(FAKE_GAME_CARD);
    //     });

    //     it('generateGameCard should create a game card from a game informations', () => {
    //         expect(service.createGameCard(FAKE_GAME_INFO)).toEqual(FAKE_GAME_CARD);
    //     });
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

// const id = new ObjectId(0);
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

// interface returnedGame {
//     __v: 0;
//     _id: ObjectId;
//     name: string;
//     difficulty: string;
//     differenceNumber: number;
//     originalImageName: string;
//     differenceImageName: string;
//     soloTimes: RankingBoard[];
//     multiTimes: RankingBoard[];
// }

// const FAKE_GAME_CARD_ANSWER: returnedGame = {
//     __v: 0,
//     _id: id,
//     name: 'game.name',
//     difficulty: 'Facile',
//     differenceNumber: 6,
//     originalImageName: 'game.baseImage',
//     differenceImageName: 'game.differenceImage',
//     soloTimes: [
//         { time: 0, name: '--' },
//         { time: 0, name: '--' },
//         { time: 0, name: '--' },
//     ],
//     multiTimes: [
//         { time: 0, name: '--' },
//         { time: 0, name: '--' },
//         { time: 0, name: '--' },
//     ],
// };
