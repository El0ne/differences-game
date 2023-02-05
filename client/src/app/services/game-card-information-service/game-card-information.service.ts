import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { STAGE } from '@app/services/server-routes';
import { GameCardInformation } from '@common/game-card';
import { GameInformation } from '@common/game-information';
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
        return this.http.post<GameCardInformation>(STAGE, body, { headers });
    }

    uploadImage(image: File, gameInfo: { name: string; baseImage: string; differenceImage: string; radius: number }): Observable<object> {
        const formData = new FormData();
        const json = JSON.stringify(gameInfo);
        const blob = new Blob([json], {
            type: 'application/json',
        });
        formData.append('data', image, image.name);
        formData.append('data', blob);
        console.log('formData', formData);
        return this.http.post(`${STAGE}/image`, formData);
    }
}
