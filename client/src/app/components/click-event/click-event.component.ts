import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PATHS } from '@app/pages/solo-view/solo-view-constants';

@Component({
    selector: 'app-click-event',
    templateUrl: './click-event.component.html',
    styleUrls: ['./click-event.component.scss'],
})
export class ClickEventComponent implements OnInit {
    @Input() differenceArray: boolean[];
    @Output() differenceDetected: EventEmitter<string> = new EventEmitter<string>();
    @Input() id: number;
    different: boolean;

    constructor() {}

    ngOnInit(): void {
        const tag = this.id.toString();
        const image = new Image();
        image.src = PATHS.temp;
        image.onload = () => {
            const canvas = document.getElementById(tag) as HTMLCanvasElement;
            const context = canvas.getContext('2d') as CanvasRenderingContext2D;
            context.drawImage(image, 0, 0);
        };
    }

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
            return false;
        } else {
            console.log('not ding');
            return true;
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

    coordChecker(e: MouseEvent) {
        this.different = this.isDifferent(e, this.differenceArray);
        if (this.different) {
            this.differenceDetected.emit('Error');
        }
    }
}
