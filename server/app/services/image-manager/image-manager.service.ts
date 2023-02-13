import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class ImageManagerService {
    deleteImage(imagePath: string) {
        try {
            fs.unlinkSync(imagePath);
        } catch (err) {
            console.log(err);
        }
    }
}
