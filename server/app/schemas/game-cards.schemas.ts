import { RankingBoard } from '@common/ranking-board';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export type GameCardDocument = GameCard & Document;

@Schema()
export class GameCard {
    @Prop()
    _id: ObjectId;

    @Prop()
    name: string;

    @Prop()
    difficulty: string;

    @Prop()
    differenceNumber: number;

    @Prop([RankingBoard])
    soloTimes: RankingBoard[];

    @Prop([RankingBoard])
    multiTimes: RankingBoard[];
}

export const gameCardSchema = SchemaFactory.createForClass(GameCard);
