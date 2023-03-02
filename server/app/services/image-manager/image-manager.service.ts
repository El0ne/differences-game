import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class ImageManagerService {
    deleteImage(imagePath: string): void {
        console.log('imagePath', imagePath);
        fs.unlinkSync(`assets/images/${imagePath}`);
    }
}
