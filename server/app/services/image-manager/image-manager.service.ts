import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class ImageManagerService {
    deleteImage(imagePath: string) {
        fs.unlink(imagePath, (err) => {
            if (err) throw err;
        });
    }
}
