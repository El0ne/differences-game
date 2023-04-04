import { Images, ImagesDocument } from '@app/schemas/images.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

@Injectable()
export class ImageManagerService {
    constructor(@InjectModel(Images.name) private imagesModel: Model<ImagesDocument>) {}

    async createImageObject(_id: ObjectId, originalImageName: string, differenceImageName: string): Promise<Images> {
        const imageObject: Images = {
            _id,
            originalImageName,
            differenceImageName,
        };
        const newImageObject = new this.imagesModel(imageObject);
        return newImageObject.save();
    }

    async getImageObjectById(id: string): Promise<Images> {
        return await this.imagesModel.findById(new ObjectId(id));
    }

    async deleteImageObject(id: string): Promise<void> {
        const test = await this.imagesModel.findByIdAndDelete(new ObjectId(id));
        console.log('test', test);
    }

    deleteImage(imageName: string): void {
        const imagePath = `assets/images/${imageName}`;
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }
}
