/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Images, imagesSchema } from '@app/schemas/images.schema';
import { getFakeImageObject } from '@app/services/mock/fake-image-objects';
import { DELAY_BEFORE_CLOSING_CONNECTION } from '@app/tests/constants';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import * as sinon from 'sinon';
import { ImageManagerService } from './image-manager.service';
describe('ImageManagerService', () => {
    let service: ImageManagerService;
    let mongoServer: MongoMemoryServer;
    // let imagesModel: Model<ImagesDocument>;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Images.name, schema: imagesSchema }]),
            ],
            providers: [ImageManagerService],
        }).compile();

        service = module.get<ImageManagerService>(ImageManagerService);
        connection = await module.get(getConnectionToken());

        // imagesModel = module.get<Model<ImagesDocument>>(getModelToken(GameCard.name));
    });

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('createImageObject should add an Image Object to the list of Image Objects', async () => {
        const fakeImageObject = getFakeImageObject();
        await service.createImageObject(fakeImageObject);
        const response = await service.getImageObjectById(fakeImageObject._id.toHexString());
        expect(response).toEqual(expect.objectContaining(fakeImageObject));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should delete the image at the provided path', () => {
        const image = 'test.bmp';
        const imagePath = `assets/images/${image}`;
        fs.writeFileSync(imagePath, 'Test image data');
        expect(fs.existsSync(imagePath)).toBe(true);
        service.deleteImage(image);
        setTimeout(() => {
            expect(fs.existsSync(imagePath)).toBe(false);
        }, 100);
    });

    it('should not throw an error even if it tries to delete an image with the wrong path', () => {
        const imagePath = '/wrong/path/test.bmp';
        const serviceStub = sinon.stub(service, 'deleteImage');
        service.deleteImage(imagePath);
        expect(serviceStub).not.toThrowError();
    });
});
