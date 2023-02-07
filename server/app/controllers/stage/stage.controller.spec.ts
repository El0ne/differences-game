import { GameCardService } from '@app/services/game-card/game-card.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { join } from 'path';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { StageController } from './stage.controller';

describe('StageController', () => {
    let controller: StageController;
    let gameCardService: SinonStubbedInstance<GameCardService>;
    const mockResponse = {
        sendFile: jest.fn().mockImplementation((imagePath, cb) => {
            cb(null);
        }),
        sendStatus: jest.fn(),
    };

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

    it('uploadImages() should call difference service and return the images', () => {
        const files = getFakeFiles();
        const gameInfo = getFakeInfo();
        const paramMock = jest.fn();
        paramMock.mockImplementation(() => ({ radius: 3 }));
        // TODO mock call to difference service when implemented
        expect(controller.uploadImages(files, paramMock)).toEqual([files.baseImage[0], files.differenceImage[0]]);
        expect(gameCardService.createGameCard.calledWith(gameInfo));
    });
    it('getImage() should get and return the image to the client', () => {
        const paramMock = { imageName: 'test' };
        controller.getImage(paramMock, mockResponse as unknown as Response);
        const filePath = join(process.cwd(), `assets/images/${paramMock.imageName}`);
        expect(mockResponse.sendFile).toHaveBeenCalledWith(filePath, expect.any(Function));
    });

    it('getImage() should return an error and status 500 if the request has an error', () => {
        const paramMock = { imageName: 'test' };
        const mockResponseError = {
            sendFile: jest.fn().mockImplementation((imagePath, cb) => {
                cb(new Error('Error sending file'));
            }),
            sendStatus: jest.fn(),
        };
        controller.getImage(paramMock, mockResponseError as unknown as Response);
        expect(mockResponseError.sendStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
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

const getFakeFiles = () => ({
    baseImage: [
        {
            fieldname: 'baseImage',
            originalname: 'image_12_diff.bmp',
            encoding: '7bit',
            mimetype: 'image/bmp',
            destination: './assets/images',
            filename: 'image_12_diff89dbd2eb-00eb-44d6-956e-2bd5e06fcfe3.bmp',
            path: 'assets/images/image_12_diff89dbd2eb-00eb-44d6-956e-2bd5e06fcfe3.bmp',
            size: 921654,
        },
    ],
    differenceImage: [
        {
            fieldname: 'differenceImage',
            originalname: 'image_12_diff.bmp',
            encoding: '7bit',
            mimetype: 'image/bmp',
            destination: './assets/images',
            filename: 'image_12_diff78e107b8-b5e9-4f0c-9cc0-511b5a919536.bmp',
            path: 'assets/images/image_12_diff78e107b8-b5e9-4f0c-9cc0-511b5a919536.bmp',
            size: 921654,
        },
    ],
});
