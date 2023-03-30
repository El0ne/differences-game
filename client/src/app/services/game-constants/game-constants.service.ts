import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GAME_CONSTANTS } from '@app/services/server-routes';
import { GameConstants } from '@common/game-constants';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameConstantsService {
    constructor(private http: HttpClient) {}

    getGameConstants(): Observable<GameConstants> {
        return this.http.get<GameConstants>(GAME_CONSTANTS);
    }

    updateGameConstants(gameConstants: GameConstants): Observable<void> {
        return this.http.put<void>(`${GAME_CONSTANTS}`, gameConstants);
    }
}
