import { Injectable } from '@angular/core';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';

@Injectable({
    providedIn: 'root',
})
export class ReplayGameService {
    leftCanvas: HTMLCanvasElement;
    rightCanvas: HTMLCanvasElement;
    currentMessage: string;

    isInLeftCanvas: boolean;
    isChatting: boolean;

    nbElements: number;
    time: number;

    infoArray = new Array();

    // eslint-disable-next-line max-params // we need to have 4 parameters
    constructor(time: TimerSoloService, leftCanvas?: HTMLCanvasElement, rightCanvas?: HTMLCanvasElement) {
        this.time = time.currentTime;
        if (leftCanvas && rightCanvas) {
            this.leftCanvas = leftCanvas;
            this.rightCanvas = rightCanvas;
        }
    }

    setMessage(message: string): void {
        this.currentMessage = message;
    }

    choseCanvas(mouseEvent: MouseEvent): void {
        const target = mouseEvent.target as HTMLCanvasElement;

        if ([this.leftCanvas].includes(target)) {
            this.isInLeftCanvas = true;
        } else if ([this.rightCanvas].includes(target)) {
            this.isInLeftCanvas = false;
        }
    }

    // savePixels(mouseEvent: MouseEvent) {
    //     this.choseCanvas(mouseEvent);

    //     this.infoArray.push({
    //         isChatting: false,
    //         xCoordinate: mouseEvent.offsetX,
    //         yCoordinate: mouseEvent.offsetY,
    //         isInLeftCanvas: this.isInLeftCanvas,
    //         time: this.time,
    //     });
    //     this.nbElements++;
    // }

    // saveChatMessage() {
    //     this.infoArray.push({
    //         isChatting: true,
    //         message: this.currentMessage,
    //         time: this.time,
    //         isAdversary: this.isChatting,
    //     });
    //     this.nbElements++;
    // }

    // replay() {
    //     for (const info of this.infoArray) {
    //         if (!info.isChatting) {
    //             while (this.time < info.time) {}
    //         } else {
    //         }
    //     }
    // }
}
