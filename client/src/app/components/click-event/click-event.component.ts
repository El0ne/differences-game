import { Component, Input, OnInit } from '@angular/core';
import { PATHS } from '@app/pages/solo-view/solo-view-constants';
import { HEIGHT, WAIT_TIME, WIDTH } from './click-event-constant';

@Component({
    selector: 'app-click-event',
    templateUrl: './click-event.component.html',
    styleUrls: ['./click-event.component.scss'],
})
export class ClickEventComponent implements OnInit {
    @Input() differenceArray: boolean[];
    @Input() id: number;
    @Input() original: string;
    timeout: boolean;

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
        this.timeout = true;
    }

    getCoordInImage(e: MouseEvent): number[] {
        const canvas = e.target as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        return new Array(x, y);
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
        const posToCheck = y * WIDTH + x;
        return array[posToCheck];
    }

    emitSound() {
        const sound = new Audio('/assets/ding.mp3');
        sound.play();
    }

    displayError(e: MouseEvent) {
        if (this.timeout) {
            const error = this.isDifferent(e, this.differenceArray);
            if (error) {
                this.timeout = false;
                const canvas = e.target as HTMLCanvasElement;
                const rect = canvas.getBoundingClientRect();
                const x = Math.floor(e.clientX - rect.left);
                const y = Math.floor(e.clientY - rect.top);
                const context = canvas.getContext('2d') as CanvasRenderingContext2D;
                context.font = '30px Arial';
                context.fillStyle = 'red';
                context.textAlign = 'center';
                context.fillText('Error', x, y);
                setTimeout(() => {
                    context.clearRect(0, 0, WIDTH, HEIGHT);
                    this.timeout = true;
                }, WAIT_TIME);
            }
        }
    }
}
