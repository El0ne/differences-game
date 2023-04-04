import { Injectable } from '@angular/core';

export interface GameParameters {
    isMultiplayerGame: boolean;
    isLimitedTimeGame: boolean;
    stageId: string;
}

@Injectable({
    providedIn: 'root',
})
export class GameParametersService {
    gameParameters: GameParameters;
}
