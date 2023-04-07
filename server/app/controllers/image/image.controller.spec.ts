/* eslint-disable no-underscore-dangle */
import { Images, imagesSchema } from '@app/schemas/images.schema';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { getFakeImageObject } from '@app/services/mock/fake-image-objects';
import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/tests/constants';
import { HttpStatus } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import * as Jimp from 'jimp';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import * as join from 'path';
import * as request from 'supertest';
import { ImageController } from './image.controller';
describe('ImageController', () => {
    let httpServer: unknown;

    let controller: ImageController;
    let imageManagerService: ImageManagerService;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;
    let app;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        const module: TestingModule = await Test.createTestingModule({
            imports: [MongooseModule.forRoot(mongoUri), MongooseModule.forFeature([{ name: Images.name, schema: imagesSchema }])],
            controllers: [ImageController],
            providers: [ImageManagerService],
        }).compile();

        app = module.createNestApplication();
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

    it('getImageNames() should return 500 if there is an error', async () => {
        jest.spyOn(imageManagerService, 'getImageObjectById').mockRejectedValue(new Error('uiref'));
        const response = await request(httpServer).get('/image');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('getImageNames() should return 500 if there is an error', async () => {
        jest.spyOn(imageManagerService, 'getImageObjectById').mockRejectedValue(new Error('uiref'));
        const response = await request(httpServer).get('/image');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('getImage() should return an image if the imageName is valid', async () => {
        const image = new Jimp(1, 1, 'white', (err) => {
            if (err) throw err;
        });

        image.write('assets/images/test.bmp');
        const response = await request(httpServer).get('/image/test.bmp');
        expect(response.statusCode).toEqual(HttpStatus.OK);
        fs.unlink('assets/images/test.bmp', (err) => {
            if (err) throw err;
        });
    });

    it('getImage() should return 500 if there is an error', async () => {
        jest.spyOn(join, 'join').mockImplementationOnce(() => {
            throw new Error();
        });

        const response = await request(httpServer).get('/image/imageName');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('deleteImage() should call imageManagerService.deleteImage() with the image name as a parameter', async () => {
        const image = new Jimp(1, 1, 'white', (err) => {
            if (err) throw err;
        });

        image.write('assets/images/test.bmp');
        jest.spyOn(imageManagerService, 'deleteImageObject').mockImplementation();

        const response = await request(httpServer).delete('/image/test.bmp');

        fs.unlink('assets/images/test.bmp', (err) => {
            if (err) throw err;
        });
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
        expect(imageManagerService.deleteImageObject).toHaveBeenCalledWith('test.bmp');
    });

    it('deleteImage() should return 500 if the request is invalid', async () => {
        jest.spyOn(imageManagerService, 'deleteImageObject').mockImplementationOnce(() => {
            throw new Error();
        });
        const wrongImage = 'wrong_image.bmp';
        const response = await request(httpServer).delete(`/image/${wrongImage}`);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(imageManagerService.deleteImageObject).toHaveBeenCalledWith(wrongImage);
    });
});
