import { ImageInformation } from '@common/image-information';

export interface ImageUploadData {
    baseImage: ImageInformation[];
    differenceImage: ImageInformation[];
}
