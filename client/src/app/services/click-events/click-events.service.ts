import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ClickEventsService {
    getCoordInImage(e: MouseEvent) {
        const canvas = e.target as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        console.log(x, y); // TODO: Replace by return when logic for differences is ready
    }
}
