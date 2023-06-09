import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CLICK } from '@app/services/server-routes';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ClickEventService {
    constructor(private http: HttpClient) {}

    getDifferences(stageId: string): Observable<number[][]> {
        return this.http.get<number[][]>(`${CLICK}/${stageId}`);
    }

    isADifference(clickPositionX: number, clickPositionY: number, id: string): Observable<ClickDifferenceVerification> {
        const options = { params: new HttpParams().set('x', clickPositionX).set('y', clickPositionY).set('id', id) };
        return this.http.get<ClickDifferenceVerification>(CLICK, options);
    }

    deleteDifferences(id: string): Observable<void> {
        return this.http.delete<void>(`${CLICK}/${id}`);
    }
}
