import { PlayerGameInfo } from '@common/player-game-info';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameHistoryDocument = GameHistory & Document;

@Schema()
export class GameHistory {
    @Prop()
    gameId: string;

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

    @Prop(PlayerGameInfo)
    player1: PlayerGameInfo;

    @Prop(PlayerGameInfo)
    player2?: PlayerGameInfo;
}

export const gameHistorySchema = SchemaFactory.createForClass(GameHistory);
