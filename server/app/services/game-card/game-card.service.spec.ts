import { gameCardsInformations } from '@app/dataBase/game-cards-informations.json';
import { Test, TestingModule } from '@nestjs/testing';
import { GameCardService } from './game-card.service';
describe('GameCardService', () => {
    let service: GameCardService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameCardService],
        }).compile();

        service = module.get<GameCardService>(GameCardService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getGameCards should return all gameCards informations between both indexes', async () => {
        const startIndex = 2;
        const endIndex = 6;
        const gameCards = service.getGameCards(startIndex, endIndex);
        expect(gameCards).toEqual(gameCardsInformations.slice(startIndex, endIndex));
    });

    it('getGameCardsNumber should return the number of gameCards informations we have', async () => {
        const gameCardsNumber = service.getGameCardsNumber();
        expect(gameCardsNumber).toEqual(gameCardsInformations.length);
    });
});
