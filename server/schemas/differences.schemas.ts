import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DifferencesDocument = Differences & Document;

@Schema()
export class Differences {
    @Prop()
    id: string;

    @Prop()
    differences: number[][];
}

export const differencesSchema = SchemaFactory.createForClass(Differences);
