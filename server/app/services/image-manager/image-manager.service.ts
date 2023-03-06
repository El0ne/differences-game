import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class ImageManagerService {
    deleteImage(imagePath: string): void {
        fs.unlink(`assets/images/${imagePath}`, () => {});
    }
}
