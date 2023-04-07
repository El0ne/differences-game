/* eslint-disable no-underscore-dangle */
import { Images, imagesSchema } from '@app/schemas/images.schema';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { getFakeImageObject } from '@app/services/mock/fake-image-objects';
import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/tests/constants';
import { HttpStatus } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { ImageController } from './image.controller';

describe('ImageController', () => {
    let httpServer: unknown;

    let controller: ImageController;
    let imageManagerService: ImageManagerService;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        const module: TestingModule = await Test.createTestingModule({
            imports: [MongooseModule.forRoot(mongoUri), MongooseModule.forFeature([{ name: Images.name, schema: imagesSchema }])],
            controllers: [ImageController],
            providers: [ImageManagerService],
        }).compile();

        const app = module.createNestApplication();
        await app.init();
        httpServer = app.getHttpServer();
        controller = module.get<ImageController>(ImageController);
        imageManagerService = module.get<ImageManagerService>(ImageManagerService);
        connection = await module.get(getConnectionToken());
    });

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getImageNames() should return the image Object if it exists', async () => {
        const fakeImage = getFakeImageObject();

        jest.spyOn(imageManagerService, 'getImageObjectById').mockImplementation(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return fakeImage as any;
        });

        const response = await request(httpServer)
            .get('/image')
            .query({ id: `${fakeImage._id}` });

        expect(imageManagerService.getImageObjectById).toHaveBeenCalled();
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toStrictEqual(fakeImage);
    });

    // it('getStages() should return 500 if there is an error', async () => {
    //     const response = await request(httpServer).get('/image');
    //     expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    // });
});
