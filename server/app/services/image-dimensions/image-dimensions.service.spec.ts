import { ImageDimensionsService } from '@app/services/image-dimensions/image-dimensions.service';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';
import { Test, TestingModule } from '@nestjs/testing';

describe('ImageDimensionsService', () => {
    let service: ImageDimensionsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ImageDimensionsService],
        }).compile();

        service = module.get<ImageDimensionsService>(ImageDimensionsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('get methods should return good dimensions in function of IMAGE_DIMENSIONS constant', () => {
        expect(service.getWidth()).toBe(IMAGE_DIMENSIONS.width);
        expect(service.getHeight()).toBe(IMAGE_DIMENSIONS.height);
        expect(service.getNumberOfPixels()).toBe(IMAGE_DIMENSIONS.width * IMAGE_DIMENSIONS.height);
    });
});
