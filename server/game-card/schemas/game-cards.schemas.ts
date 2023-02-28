import { RankingBoard } from '@common/ranking-board';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// export type GameCardDocument = HydratedDocument<GameCard>;
export type GameCardDocument = GameCard & Document;

@Schema()
export class GameCard {
    @Prop()
    id: string;

    @Prop()
    name: string;

    @Prop()
    difficulty: string;

    @Prop()
    differenceNumber: number;

    @Prop()
    originalImageName: string;

    @Prop()
    differenceImageName: string;

    @Prop([RankingBoard])
    soloTimes: RankingBoard[];

    @Prop([RankingBoard])
    multiTimes: RankingBoard[];
}

export const gameCardSchema = SchemaFactory.createForClass(GameCard);
