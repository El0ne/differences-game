import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PixelRadiusService {
    getAdjacentPixels(pixelLocation: number, radiusSize: number): number[] {
        // utiliser les constantes globales a la place
        const imageWidth = 640;
        const imageHeight = 480;
        const pixelCoordinateX = pixelLocation % imageWidth;
        const pixelCoordinateY = Math.floor(pixelLocation / imageWidth);
        const pixelsAroundMyPixel: number[] = [];

        const leftExtremity = Math.max(pixelCoordinateX - radiusSize, 0);
        const rightExtremity = Math.min(pixelCoordinateX + radiusSize, imageWidth);
        const downExtremity = Math.max(pixelCoordinateY - radiusSize, 0);
        const upExtremity = Math.min(pixelCoordinateY + radiusSize, imageHeight);

        for (let j = downExtremity; j <= upExtremity; j++) {
            for (let i = leftExtremity; i <= rightExtremity; i++) {
                pixelsAroundMyPixel.push(j * imageWidth + i);
            }
        }

        return pixelsAroundMyPixel;
    }
}
