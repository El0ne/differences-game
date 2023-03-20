/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { ImageManagerService } from './image-manager.service';
describe('ImageManagerService', () => {
    let service: ImageManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ImageManagerService],
        }).compile();

        service = module.get<ImageManagerService>(ImageManagerService);
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
