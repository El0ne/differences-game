import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Observable } from 'rxjs';
// TODO: Check if any way to unlint import
// eslint-disable-next-line no-restricted-imports
import { CLICK } from '../server-routes';

@Injectable({
    providedIn: 'root',
})
export class ClickEventService {
    constructor(private http: HttpClient) {}

    isADifference(clickPositionX: number, clickPositionY: number, id: string): Observable<ClickDifferenceVerification> {
        const options = { params: new HttpParams().set('x', clickPositionX).set('y', clickPositionY).set('id', id) };
        return this.http.get<ClickDifferenceVerification>(CLICK, options);
    }

    setDifferences(stageId: string): Observable<number[][]> {
        return this.http.get<number[][]>(`${CLICK}/${stageId}`);
    }
}