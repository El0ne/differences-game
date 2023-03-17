import { Injectable } from '@angular/core';
import { FAST_WAIT_TIME_MS, WIDTH } from '@app/components/click-event/click-event-constant';

@Injectable({
    providedIn: 'root',
})
export class PixelModificationService {
    getCoordInImage(mouseEvent: MouseEvent, rect: DOMRect): number[] {
        const x = Math.max(Math.floor(mouseEvent.clientX - rect.left), 0);
        const y = Math.max(Math.floor(mouseEvent.clientY - rect.top), 0);
        return [x, y];
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

    turnDifferenceYellow(context: CanvasRenderingContext2D, differences: number[]): void {
        for (const pixel of differences) {
            const pos: number[] = this.positionToPixel(pixel);
            context.fillStyle = '#FFD700';
            context.fillRect(pos[0], pos[1], 1, 1);
        }
    }

    turnOffYellow(context: CanvasRenderingContext2D, differences: number[]): void {
        for (const pixel of differences) {
            const pos: number[] = this.positionToPixel(pixel);
            context.clearRect(pos[0], pos[1], 1, 1);
        }
    }

    async delay(ms: number): Promise<void> {
        return new Promise((res) => setTimeout(res, ms));
    }

    async flashEffect(context: CanvasRenderingContext2D, differences: number[]): Promise<void> {
        for (let i = 0; i < 2; i++) {
            this.turnDifferenceYellow(context, differences);
            await this.delay(FAST_WAIT_TIME_MS);
            this.turnOffYellow(context, differences);
            await this.delay(FAST_WAIT_TIME_MS);
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
