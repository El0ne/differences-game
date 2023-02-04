import { GameCardService } from '@app/services/game-card/game-card.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { StageController } from './stage.controller';

describe('StageController', () => {
    let controller: StageController;
    let gameCardService: SinonStubbedInstance<GameCardService>;

    beforeEach(async () => {
        gameCardService = createStubInstance(GameCardService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StageController],
            providers: [
                {
                    provide: GameCardService,
                    useValue: gameCardService,
                },
            ],
        }).compile();
        controller = module.get<StageController>(StageController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getStages() should call GameCardService.getGameCards(index, endIndex)', () => {
        const fakeGameCards = getFakeGameCards();
        gameCardService.getGameCards.returns(fakeGameCards);
        const stages = controller.getStages(1, 1);
        expect(stages).toEqual(fakeGameCards);
        expect(gameCardService.getGameCards.calledOnce).toBeTruthy();
    });

    it('getNbOfStages() should call GameCardService.getGameCardsNumber()', () => {
        const fakeGameCardsNumber = 6;
        gameCardService.getGameCardsNumber.returns(fakeGameCardsNumber);
        const stages = controller.getNbOfStages();
        expect(stages).toEqual(fakeGameCardsNumber);
        expect(gameCardService.getGameCardsNumber.calledOnce).toBeTruthy();
    });
});

const getFakeGameCards = () => [
    {
        name: 'Library',
        difficulty: 'Difficile',
        image: '/assets/444-640x480.jpg',
        soloTimes: [
            { time: 60, name: 're' },
            { time: 90, name: 'second' },
            { time: 105, name: 'third' },
        ],
        multiTimes: [
            { time: 63, name: 'First' },
            { time: 92, name: 'second' },
            { time: 115, name: 'third' },
        ],
    },
];
