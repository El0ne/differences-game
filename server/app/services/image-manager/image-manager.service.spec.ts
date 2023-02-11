/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
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
        const imagePath = 'assets/images/test.bmp';
        fs.writeFileSync(imagePath, 'Test image data');
        expect(fs.existsSync(imagePath)).toBe(true);
        service.deleteImage(imagePath);
        setTimeout(() => {
            expect(fs.existsSync(imagePath)).toBe(false);
        }, 100);
    });
});
