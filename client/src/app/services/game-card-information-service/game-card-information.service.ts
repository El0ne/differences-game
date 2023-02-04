import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameInformation } from '@app/model/game-information';
import { STAGE } from '@app/services/server-routes';
import { GameCardInformation } from '@common/game-card';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameCardInformationService {
    constructor(private http: HttpClient) {}

    getGameCardsInformations(index: number, endIndex: number): Observable<GameCardInformation[]> {
        const options = { params: new HttpParams().set('index', index).set('endIndex', endIndex) };
        return this.http.get<GameCardInformation[]>(STAGE, options);
    }

    getNumberOfGameCardInformation(): Observable<number> {
        return this.http.get<number>(`${STAGE}/info`);
    }

    createGame(gameInfo: GameInformation): Observable<GameCardInformation> {
        const headers = { 'content-type': 'application/json' };
        const body = JSON.stringify(gameInfo);
        console.log(body);
        return this.http.post<GameCardInformation>(STAGE, body, { headers });
    }
}
