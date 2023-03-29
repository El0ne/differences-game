/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GameCard, gameCardSchema } from '@app/schemas/game-cards.schemas';
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

    it('updateBestTimes should return a ranking board with the updated best times for a solo game', () => {
        const updatedRankingBoard = service.updateBestTimes(FAKE_RANKING_BOARD, FAKE_WINNER_BOARD);
        expect(updatedRankingBoard[0].name).toBe(FAKE_WINNER_BOARD.name);
        expect(updatedRankingBoard[0].time).toBe(FAKE_WINNER_BOARD.time);
        expect(updatedRankingBoard[1].name).toBe('Yvon Gagné');
        expect(updatedRankingBoard[1].time).toBe(15);
        expect(updatedRankingBoard[2].name).toBe('Pierre Laroche');
        expect(updatedRankingBoard[2].time).toBe(20);
    });

    const FAKE_RANKING_BOARD: RankingBoard[] = [
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

const FAKE_WINNER_BOARD: RankingBoard = {
    name: 'Victoria Lavictoire',
    time: 10,
};
