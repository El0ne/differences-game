import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Schema } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema()
export class GameCardInformation {
    @ApiProperty()
    @Prop({ required: true })
    id: string;

    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    difficulty: string;

    @ApiProperty()
    @Prop({ required: true })
    differenceNumber: number;

    @ApiProperty()
    @Prop({ required: true })
    originalImageName: number;

    @ApiProperty()
    @Prop({ required: true })
    differenceImageName: number;

    @ApiProperty()
    @Prop({ required: true })
    soloTimes: { time: number; name: string }[];

    @ApiProperty()
    @Prop({ required: true })
    multiTimes: { time: number; name: string }[];
}

export const GameCardInformationSchema = SchemaFactory.createForClass(GameCardInformation);
