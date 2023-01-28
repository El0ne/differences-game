import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

    // async getGameCardsInformations(index: number, endIndex: number): Promise<GameCardInformation[]> {
    //     let yo: GameCardInformation[] = [];
    //     const req = await this.http.get<GameCardInformation[]>(`${STAGE}/${index}/${endIndex}`);
    //     req.subscribe((data) => {
    //         yo = data;
    //     });
    //     return yo;
    // }
}
