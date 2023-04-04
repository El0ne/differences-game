import { Images, imagesSchema } from '@app/schemas/images.schema';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { ImageController } from './image.controller';

describe('ImageController', () => {
    let controller: ImageController;

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

        controller = module.get<ImageController>(ImageController);
        connection = await module.get(getConnectionToken());
    });

    const DELAY_BEFORE_CLOSING_CONNECTION = 200;
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
});
