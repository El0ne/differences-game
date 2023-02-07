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

    it('createGame() should call GameCardService.createGameCard() with the body as a parameter', () => {
        const gameInfo = getFakeInfo();
        controller.createGame(gameInfo);
        expect(gameCardService.createGameCard.calledWith(gameInfo));
    });

    // it('storage should generate a bmp file with a random name', () => {
    //     const file = { originalname: 'randomFile.bmp' };
    //     const cb = jest.fn();
    //     storage.filename(null, file, cb);
    //     expect(cb.mock.calls.length).toBe(1);
    //     expect(cb.mock.calls[0][0]).toBe(null);
    //     expect(path.parse(cb.mock.calls[0][1]).name).toMatch(new RegExp(`${uuidv4()}`));
    //     expect(path.parse(cb.mock.calls[0][1]).ext).toBe('.bmp');
    // });

    // it('uploadImages() should call difference service and return the images', () => {
    //     const files = getFakeFiles();
    //     // TODO mock call to difference service when implemented
    //     expect(controller.createGame(files)).toEqual([files.baseImage[0], files.differenceImage[0]]);
    //     expect(gameCardService.createGameCard.calledWith(gameInfo));
    // });
});

const getFakeInfo = () => ({
    name: 'Fake Title',
    baseImage: 'baseImage/path',
    differenceImage: 'differenceImage/path',
    radius: 3,
});

const getFakeGameCards = () => [
    {
        name: 'Library',
        difficulty: 'Difficile',
        originalImage: '/assets/444-640x480.jpg',
        differenceImage: '/assets/444-640x480.jpg',
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
