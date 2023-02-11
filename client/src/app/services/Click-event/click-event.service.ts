import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Observable } from 'rxjs';
import { CLICK } from '../server-routes';

@Injectable({
    providedIn: 'root',
})
export class ClickEventService {
    constructor(private http: HttpClient) {}

    isADifference(clickPositionX: number, clickPositionY: number, stageId: number, radius: number): Observable<ClickDifferenceVerification> {
        const options = { params: new HttpParams().set('x', clickPositionX).set('y', clickPositionY).set('id', stageId).set('radius', radius) };
        return this.http.get<ClickDifferenceVerification>(CLICK, options);
    }
}
