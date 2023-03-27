import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BEST_TIME } from '@app/services/server-routes';
import { BestTimeInformation } from '@common/best-time';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BestTimeService {
    constructor(public http: HttpClient) {}

    getBestTimesFromId(id: string): Observable<BestTimeInformation> {
        return this.http.get<BestTimeInformation>(`${BEST_TIME}/${id}`);
    }

    getBestTimes(index: number, endIndex: number): Observable<BestTimeInformation[]> {
        const options = { params: new HttpParams().set('index', index).set('endIndex', endIndex) };
        return this.http.get<BestTimeInformation[]>(BEST_TIME, options);
    }

    setDefaultBestTimes(defaultBestTimes: BestTimeInformation): Observable<BestTimeInformation> {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const headers = { 'content-type': 'application/json' };
        const body = JSON.stringify(defaultBestTimes);
        return this.http.post<BestTimeInformation>(BEST_TIME, body, { headers });
    }

    updateBestTimes(newBestTime: BestTimeInformation): Observable<BestTimeInformation> {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const headers = { 'content-type': 'application/json' };
        const body = JSON.stringify(newBestTime);
        return this.http.patch<BestTimeInformation>(BEST_TIME, body, { headers });
    }

    resetBestTimes(defaultBestTimes: BestTimeInformation): Observable<BestTimeInformation> {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const headers = { 'content-type': 'application/json' };
        const body = JSON.stringify(defaultBestTimes);
        return this.http.put<BestTimeInformation>(BEST_TIME, body, { headers });
    }
}
