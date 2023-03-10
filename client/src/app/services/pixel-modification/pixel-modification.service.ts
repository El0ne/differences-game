import { Injectable } from '@angular/core';
import { WIDTH } from '@app/components/click-event/click-event-constant';

@Injectable({
    providedIn: 'root',
})
export class PixelModificationService {
    getCoordInImage(e: MouseEvent, rect: DOMRect): number[] {
        const x = Math.max(Math.floor(e.clientX - rect.left), 0);
        const y = Math.max(Math.floor(e.clientY - rect.top), 0);
        return new Array(x, y);
    }

    positionToPixel(toTransform: number): number[] {
        let yCounter = 0;
        while (toTransform >= WIDTH) {
            toTransform -= WIDTH;
            if (toTransform >= 0) {
                yCounter += 1;
            }
        }
        return [toTransform, yCounter];
    }

    turnDifferenceYellow(originalContext: CanvasRenderingContext2D, differences: number[]): void {
        for (const pixel of differences) {
            const pos: number[] = this.positionToPixel(pixel);
            originalContext.fillStyle = '#FFD700';
            originalContext.fillRect(pos[0], pos[1], 1, 1);
        }
    }

    turnOffYellow(originalContext: CanvasRenderingContext2D, differences: number[]): void {
        for (const pixel of differences) {
            const pos: number[] = this.positionToPixel(pixel);
            originalContext.clearRect(pos[0], pos[1], 1, 1);
        }
    }

    errorMessage(e: MouseEvent, rect: DOMRect, context: CanvasRenderingContext2D): void {
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        context.font = '30pt Arial';
        context.fillStyle = 'red';
        context.textAlign = 'center';
        const error = 'Error';
        context.fillText(error, x, y);
    }

    getColorFromDifference(context: CanvasRenderingContext2D, differenceArray: number[]): ImageData[] {
        const colorArray = [];

        for (const position of differenceArray) {
            const pos = this.positionToPixel(position);
            const pixel = context.getImageData(pos[0], pos[1], 1, 1);
            colorArray.push(pixel);
        }
        return colorArray;
    }

    paintColorFromDifference(colorArray: ImageData[], positionArray: number[], context: CanvasRenderingContext2D): void {
        for (let i = 0; i < positionArray.length; i++) {
            const diffPixel = `rgba(${colorArray[i].data[0]},${colorArray[i].data[1]},${colorArray[i].data[2]},${colorArray[i].data[3]})`;
            context.fillStyle = diffPixel;
            const posInPixels = this.positionToPixel(positionArray[i]);
            context.fillRect(posInPixels[0], posInPixels[1], 1, 1);
        }
    }
}
