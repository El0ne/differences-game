import { IMAGE_DIMENTIONS } from '@common/image-dimentions';
import { Test, TestingModule } from '@nestjs/testing';
import { ImageDimentionsService } from './image-dimentions.service';

describe('ImageDimentionsService', () => {
    let service: ImageDimentionsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ImageDimentionsService],
        }).compile();

        service = module.get<ImageDimentionsService>(ImageDimentionsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('get methods should return good dimentions in function of IMAGE_DIMENTIONS constant', () => {
        expect(service.getWidth()).toBe(IMAGE_DIMENTIONS.width);
        expect(service.getHeight()).toBe(IMAGE_DIMENTIONS.height);
        expect(service.getNumberOfPixels()).toBe(IMAGE_DIMENTIONS.width * IMAGE_DIMENTIONS.height);
    });
});
