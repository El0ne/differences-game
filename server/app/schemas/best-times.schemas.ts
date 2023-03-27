import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export type BestTimeDocument = BestTime & Document;

@Schema()
export class BestTime {
    @Prop()
    _id: ObjectId;

    @Prop()
    winner: string;

    @Prop()
    position: string;

    @Prop()
    gameName: string;

    @Prop()
    mode: string;
}

export const bestTimeSchema = SchemaFactory.createForClass(BestTime);
