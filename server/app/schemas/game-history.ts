import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameHistoryDocument = GameHistory & Document;

@Schema()
export class GameHistory {
    @Prop()
    id: string;

    @Prop()
    winnerName: string;

    @Prop()
    player1Name: string;

    @Prop()
    player2Name: string;

    @Prop()
    gameName: string;

    @Prop()
    gameMode: string;

    @Prop()
    gameDuration: number;

    @Prop()
    startTime: string;

    @Prop()
    isMultiplayer: boolean;

    @Prop()
    isAbandon: boolean;
}

export const gameHistorySchema = SchemaFactory.createForClass(GameHistory);
