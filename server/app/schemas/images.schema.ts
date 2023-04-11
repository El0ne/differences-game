import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export type ImagesDocument = Images & Document;

@Schema()
export class Images {
    @Prop()
    _id: ObjectId;

    @Prop()
    originalImageName: string;

    @Prop()
    differenceImageName: string;
}

export const imagesSchema = SchemaFactory.createForClass(Images);
