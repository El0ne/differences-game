import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class ImageManagerService {
    async deleteImage(imagePath: string): Promise<void> {
        await fs.unlink(`assets/images/${imagePath}`, (err) => {
            console.log('deleted');
            console.log(err);
        });
    }
}
