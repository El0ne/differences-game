import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { STAGE } from '@app/services/server-routes';
import { GameCardInformation } from '@common/game-card';
import { GameCardDto } from '@common/game-card.dto';
import { ServerGeneratedGameInfo } from '@common/server-generated-game-info';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameCardInformationService {
    constructor(public http: HttpClient) {}

    getGameCardInfoFromId(id: string): Observable<GameCardInformation> {
        return this.http.get<GameCardInformation>(`${STAGE}/${id}`);
    }

    getGameCardsInformations(index: number, endIndex: number): Observable<GameCardInformation[]> {
        const options = { params: new HttpParams().set('index', index).set('endIndex', endIndex) };
        return this.http.get<GameCardInformation[]>(STAGE, options);
    }

    getNumberOfGameCardInformation(): Observable<number> {
        return this.http.get<number>(`${STAGE}/info`);
    }

    createGame(gameInfo: GameCardDto): Observable<GameCardInformation> {
        // content-type was causing a linting error otherwise
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const headers = { 'content-type': 'application/json' };
        const body = JSON.stringify(gameInfo);
        return this.http.post<GameCardInformation>(STAGE, body, { headers });
    }

    uploadImages(baseImage: File, differenceImage: File, radius: number): Observable<ServerGeneratedGameInfo> {
        const formData = new FormData();
        formData.append('baseImage', baseImage, baseImage.name);
        formData.append('differenceImage', differenceImage, differenceImage.name);
        return this.http.post<ServerGeneratedGameInfo>(`${STAGE}/image/${radius}`, formData);
    }

    deleteGame(gameId: string) {
        console.log('here');
        console.log('`${STAGE}/${gameId}`', `${STAGE}/${gameId}`);
        // return this.http.delete(`${STAGE}/${gameId}`);
        return this.http.delete<void>('http://localhost:3000/api/stage/6400e417671f9ffe5d138e7f');
    }
}
