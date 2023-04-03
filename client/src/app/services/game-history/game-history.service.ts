import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GAME_HISTORY } from '@app/services/server-routes';
import { GameHistoryDTO } from '@common/game-history.dto';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameHistoryService {
    constructor(private http: HttpClient) {}

    getGameHistory(): Observable<GameHistoryDTO[]> {
        return this.http.get<GameHistoryDTO[]>(GAME_HISTORY);
    }

    deleteGameHistory(): Observable<GameHistoryDTO[]> {
        return this.http.delete<GameHistoryDTO[]>(GAME_HISTORY);
    }

    addGameHistory(gameHistory: GameHistoryDTO): Observable<GameHistoryDTO> {
        return this.http.post<GameHistoryDTO>(GAME_HISTORY, gameHistory);
    }
}
