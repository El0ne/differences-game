import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameCardInformation } from '@common/game-card';
import { GameInformation } from '@common/game-information';
import { ImageInformation } from '@common/image-information';
import { ImageUploadData } from '@common/image-upload-data';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as request from 'supertest';
import { StageController } from './stage.controller';

describe('StageController', () => {
    let httpServer: unknown;
    let controller: StageController;
    let gameCardService: SinonStubbedInstance<GameCardService>;
    // const mockResponse = {
    //     sendFile: jest.fn().mockImplementation((imagePath, cb) => {
    //         cb(null);
    //     }),
    //     sendStatus: jest.fn(),
    //     send: jest.fn(),
    //     status: jest.fn(),
    // };

    beforeAll(async () => {
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
        const app = module.createNestApplication();
        await app.init();
        httpServer = app.getHttpServer();
        controller = module.get<StageController>(StageController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getStages() should return game cards if there are at least one', async () => {
        const getGameCardMock = jest.spyOn(controller.gameCardService, 'getGameCards').mockImplementation(() => FAKE_GAME_CARD_ARRAY);
        const response = await request(httpServer).get('/stage');
        expect(getGameCardMock).toBeCalled();
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual(FAKE_GAME_CARD_ARRAY);
    });

    it('getStages() should return 500 if there is an error', async () => {
        jest.spyOn(controller.gameCardService, 'getGameCards').mockImplementation(() => {
            throw new Error();
        });
        const response = await request(httpServer).get('/stage');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('getNbOfStages() should return the game cards number', async () => {
        const getGameCardNumberMock = jest.spyOn(controller.gameCardService, 'getGameCardsNumber').mockImplementation(() => 3);
        const response = await request(httpServer).get('/stage/info');
        expect(getGameCardNumberMock).toBeCalled();
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual({ numberOfGameInformations: 3 });
    });

    it('getNbOfStages() should return 500 if there is an error', async () => {
        jest.spyOn(controller.gameCardService, 'getGameCardsNumber').mockImplementation(() => {
            throw new Error();
        });
        const response = await request(httpServer).get('/stage/info');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('createGame() should call GameCardService.createGameCard() with the body as a parameter', async () => {
        const createGameCardMock = jest.spyOn(controller.gameCardService, 'createGameCard').mockImplementation(() => FAKE_GAME_CARD_ARRAY[0]);
        const response = await request(httpServer).post('/stage').send(FAKE_GAME_INFO);
        expect(createGameCardMock).toBeCalled();
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toEqual(FAKE_GAME_CARD);
    });

    it('createGame() should return 400 if we pass an empty body as a parameter', async () => {
        const response = await request(httpServer).post('/stage').send([]);
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('createGame() should return 500 if there is an error', async () => {
        jest.spyOn(controller.gameCardService, 'createGameCard').mockImplementation(() => {
            throw new Error();
        });
        const response = await request(httpServer).post('/stage').send(FAKE_GAME_INFO);
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('uploadImages() should call the difference detection services with the body as a parameter', async () => {
        // TODO
    });

    it('uploadImages() should return 400 if we pass an empty body as a parameter', async () => {
        const response = await request(httpServer)
            .post('/stage/image/3')
            .attach('baseImage', Buffer.from(''))
            .attach('differenceImage', Buffer.from(''));
        expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('createGame() should return 500 if there is an error', async () => {
        jest.spyOn(controller.gameCardService, 'createGameCard').mockImplementation(() => {
            throw new Error();
        });
        const response = await request(httpServer).post('/stage').send(FAKE_GAME_INFO);
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    // it('uploadImages() should call difference service and return the images', () => {
    //     const files = getFakeFiles();
    //     const gameInfo = getFakeInfo();
    //     const paramMock = jest.fn();
    //     paramMock.mockImplementation(() => ({ radius: 3 }));
    //     // TODO mock call to difference service when implemented
    //     expect(controller.uploadImages(files, paramMock, mockResponse as unknown as Response)).toEqual([
    //         files.baseImage[0],
    //         files.differenceImage[0],
    //     ]);
    //     expect(gameCardService.createGameCard.calledWith(gameInfo));
    // });
    // it('getImage() should get and return the image to the client', () => {
    //     const paramMock = { imageName: 'test' };
    //     controller.getImage(paramMock, mockResponse as unknown as Response);
    //     const filePath = join(process.cwd(), `assets/images/${paramMock.imageName}`);
    //     expect(mockResponse.sendFile).toHaveBeenCalledWith(filePath, expect.any(Function));
    // });

    // it('getImage() should return an error and status 500 if the request has an error', () => {
    //     const paramMock = { imageName: 'test' };
    //     const mockResponseError = {
    //         sendFile: jest.fn().mockImplementation((imagePath, cb) => {
    //             cb(new Error('Error sending file'));
    //         }),
    //         sendStatus: jest.fn(),
    //     };
    //     controller.getImage(paramMock, mockResponseError as unknown as Response);
    //     expect(mockResponseError.sendStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    // });

    // // it('storage should generate a bmp file with a random name', () => {
    // //     const file = { originalname: 'randomFile.bmp' };
    // //     const cb = jest.fn();
    // //     storage.filename(null, file, cb);
    // //     expect(cb.mock.calls.length).toBe(1);
    // //     expect(cb.mock.calls[0][0]).toBe(null);
    // //     expect(path.parse(cb.mock.calls[0][1]).name).toMatch(new RegExp(`${uuidv4()}`));
    // //     expect(path.parse(cb.mock.calls[0][1]).ext).toBe('.bmp');
    // // });
});

const FAKE_GAME_INFO: GameInformation = {
    name: 'Fake Title',
    baseImage: 'baseImage/path',
    differenceImage: 'differenceImage/path',
    radius: 3,
};

const FAKE_GAME_CARD: GameCardInformation = {
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
};

const FAKE_GAME_CARD_ARRAY: GameCardInformation[] = [FAKE_GAME_CARD, FAKE_GAME_CARD];

const FAKE_IMAGE_INFORMATION: ImageInformation = {
    fieldname: 'baseImage',
    originalname: 'image_12_diff.bmp',
    encoding: '7bit',
    mimetype: 'image/bmp',
    destination: './assets/images',
    filename: 'image_12_diff89dbd2eb-00eb-44d6-956e-2bd5e06fcfe3.bmp',
    path: 'assets/images/image_12_diff89dbd2eb-00eb-44d6-956e-2bd5e06fcfe3.bmp',
    size: 921654,
};

const FAKE_FILE: ImageUploadData = {
    baseImage: [FAKE_IMAGE_INFORMATION],
    differenceImage: [FAKE_IMAGE_INFORMATION],
};
