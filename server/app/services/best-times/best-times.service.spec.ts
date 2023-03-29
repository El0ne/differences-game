/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GameCard, gameCardSchema } from '@app/schemas/game-cards.schemas';
import { RankingBoard } from '@common/ranking-board';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { BestTimesService } from './best-times.service';

describe('BestTimesService', () => {
    let service: BestTimesService;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

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
                MongooseModule.forFeature([{ name: GameCard.name, schema: gameCardSchema }]),
            ],
            providers: [BestTimesService],
        }).compile();

        service = module.get<BestTimesService>(BestTimesService);
        connection = await module.get(getConnectionToken());

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
    });

    it('updateBestTimes should return a ranking board with the updated best times', () => {
        const updatedRankingBoard = service.updateBestTimes(FAKE_RANKING_BOARD, FAKE_WINNER_BOARD);
        expect(updatedRankingBoard[0]).toBe(FAKE_WINNER_BOARD);
        expect(updatedRankingBoard[1]).toBe(FAKE_RANKING_BOARD[0]);
        expect(updatedRankingBoard[2]).toBe(FAKE_RANKING_BOARD[1]);
    });

    it('updateBestTimes should return a ranking board with the same best times if the newTime is not in the top 3', () => {
        const updatedRankingBoard = service.updateBestTimes(FAKE_RANKING_BOARD, FAKE_LOSER_BOARD);
        expect(updatedRankingBoard[0]).toBe(FAKE_RANKING_BOARD[0]);
        expect(updatedRankingBoard[1]).toBe(FAKE_RANKING_BOARD[1]);
        expect(updatedRankingBoard[2]).toBe(FAKE_RANKING_BOARD[2]);
    });
});

const FAKE_WINNER_BOARD: RankingBoard = {
    name: 'Victoria Lavictoire',
    time: 10,
};

const FAKE_LOSER_BOARD: RankingBoard = {
    name: 'Louis-Philippe Ladéfaite',
    time: 60,
};
