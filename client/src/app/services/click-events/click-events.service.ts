import { Injectable } from '@angular/core';
// TODO : Transform into component
@Injectable({
    providedIn: 'root',
})
export class ClickEventsService {
    getCoordInImage(e: MouseEvent) {
        const canvas = e.target as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        return [x, y];
    }

    isDifferent(e: MouseEvent, differenceArray: number[][]): boolean {
        if (!this.isADifference(differenceArray, this.getCoordInImage(e)[0], this.getCoordInImage(e)[1])) {
            this.emitSound();
            return true;
        } else {
            console.log('not ding');
            return false;
        }
    }

    isADifference(array: number[][], x: number, y: number) {
        const posToCheck = y * 640 + x;
        for (const difference of array) {
            for (const positions of difference) if ((difference[positions] = posToCheck)) return true;
        }
        return false;
    }

    emitSound() {
        const sound = new Audio('/assets/ding.mp3');
        sound.play();
    }
}
