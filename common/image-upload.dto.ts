import { ImageDto } from './image.dto';

export interface ImageUploadDto {
    baseImage: ImageDto[];
    differenceImage: ImageDto[];
}
