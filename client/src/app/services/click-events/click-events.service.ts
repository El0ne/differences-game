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

    isDifferent(e: MouseEvent, differenceArray: boolean[]): boolean {
        if (!this.isADifference(differenceArray, this.getCoordInImage(e)[0], this.getCoordInImage(e)[1])) {
            this.emitSound();
            return true;
        } else {
            console.log('not ding');
            return false;
        }
    }

    isADifference(array: boolean[], x: number, y: number) {
        const posToCheck = y * 640 + x;
        return array[posToCheck];
    }

    emitSound() {
        const sound = new Audio('/assets/ding.mp3');
        sound.play();
    }
}
