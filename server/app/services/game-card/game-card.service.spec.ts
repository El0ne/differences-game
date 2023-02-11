import { GameCardInformation } from '@common/game-card';
import { GameInformation } from '@common/game-information';
import { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing/test';
import * as path from 'path';
import { stub } from 'sinon';
import { GameCardService } from './game-card.service';
import { gameCardsInformations } from './game-cards-test.json';

describe('GameCardService', () => {
    let service: GameCardService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameCardService],
        }).compile();

        service = module.get<GameCardService>(GameCardService);
        service.jsonPath = path.join(__dirname, '/game-cards-test.json');
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getAllGameCards should return all gameCards informations', async () => {
        const gameCards = service.getAllGameCards();
        expect(gameCards).toEqual(gameCardsInformations);
    });
    it('getGameCards should return all gameCards informations between both indexes', async () => {
        const startIndex = 0;
        const endIndex = 1;
        const gameCards = service.getGameCards(startIndex, endIndex);
        expect(gameCards).toEqual(gameCardsInformations.slice(startIndex, endIndex));
    });

    it('getGameCardById should return a specific game card', async () => {
        const gameCard = service.getGameCardById('0123');
        expect(gameCard).toEqual(gameCardsInformations.find((gameCard) => (gameCard.id = '0123')));
    });

    it('getGameCardsNumber should return the number of gameCards informations we have', async () => {
        const gameCardsNumber = service.getGameCardsNumber();
        expect(gameCardsNumber).toEqual(gameCardsInformations.length);
    });

    it('createGameCard should add a game card to the list of game cards', () => {
        stub(service, 'generateGameCard').callsFake(() => FAKE_GAME_CARD);
        service.createGameCard(FAKE_GAME_INFO);
        const allGameCards = service.getAllGameCards();
        expect(allGameCards).toContainEqual(FAKE_GAME_CARD);
    });

    it('generateGameCard should create a game card from a game informations', () => {
        expect(service.createGameCard(FAKE_GAME_INFO)).toEqual(FAKE_GAME_CARD);
    });
});

const FAKE_GAME_INFO: GameInformation = {
    id: '0',
    name: 'game.name',
    difficulty: 'Facile',
    baseImage: 'game.baseImage',
    differenceImage: 'game.differenceImage',
    radius: 3,
    differenceNumber: 6,
};
const FAKE_GAME_CARD: GameCardInformation = {
    id: '0',
    name: 'game.name',
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
};
