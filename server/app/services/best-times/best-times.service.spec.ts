import { GameCard, gameCardSchema } from '@app/schemas/game-cards.schemas';
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
});
