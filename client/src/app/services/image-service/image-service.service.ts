import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// eslint-disable-next-line no-restricted-imports
import { STAGE } from '../server-routes';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    constructor(private http: HttpClient) {}

    uploadImage(image: File): void {
        const formData = new FormData();

        formData.append('image', image);

        this.http.post(`${STAGE}/image`, formData);
    }
}
