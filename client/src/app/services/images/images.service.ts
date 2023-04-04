import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IMAGE } from '@app/services/server-routes';
import { ImageObject } from '@common/image-object';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ImagesService {
    constructor(private http: HttpClient) {}

    getImageNames(id: string): Observable<ImageObject> {
        const options = { params: new HttpParams().set('id', id) };
        return this.http.get<ImageObject>(IMAGE, options);
    }
}
