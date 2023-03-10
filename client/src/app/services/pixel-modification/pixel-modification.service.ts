import { Injectable } from '@angular/core';
import { WIDTH } from '@app/components/click-event/click-event-constant';

@Injectable({
    providedIn: 'root',
})
export class PixelModificationService {
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
}
