import { GameCard, gameCardSchema } from '@app/schemas/game-cards.schemas';
import { GameCardInformation } from '@common/game-card';
import { RankingBoard } from '@common/ranking-board';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BestTimesService } from './best-times.service';

describe('BestTimesService', () => {
    let service: BestTimesService;
    let mongoServer: MongoMemoryServer;

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
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // it('resetAllGameCards should call resetGameCard', async () => {
    //     const resetGameCardMock = jest.spyOn(service, 'resetGameCard');
    //     await service.resetAllGameCards();
    //     expect(resetGameCardMock).toBeCalled();
    // });

    it('updateBestTimes should return a ranking board with the updated best times for a solo game', () => {
        const updatedGameCard = service.updateBestTimes(FAKE_GAME_CARD, FAKE_WINNER_BOARD, false);
        expect(updatedGameCard.soloTimes[0].name).toBe(FAKE_WINNER_BOARD.name);
        expect(updatedGameCard.soloTimes[0].time).toBe(FAKE_WINNER_BOARD.time);
    });

    it('updateBestTimes should return a ranking board with the updated best times for a 1v1 game', () => {
        const updatedGameCard = service.updateBestTimes(FAKE_GAME_CARD, FAKE_WINNER_BOARD, true);
        expect(updatedGameCard.multiTimes[0].name).toBe(FAKE_WINNER_BOARD.name);
        expect(updatedGameCard.multiTimes[0].time).toBe(FAKE_WINNER_BOARD.time);
    });
});

const FAKE_GAME_CARD: GameCardInformation = {
    _id: '',
    name: 'newGame',
    difficulty: 'hard',
    differenceNumber: 7,
    originalImageName: 'urlImage1',
    differenceImageName: 'urlImage2',
    soloTimes: [
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
    ],
    multiTimes: [
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
    ],
};

const FAKE_WINNER_BOARD: RankingBoard = {
    name: 'Victoria Lavictoire',
    time: 10,
};
