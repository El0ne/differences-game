import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PATHS } from '@app/pages/solo-view/solo-view-constants';
import { HEIGHT, WAIT_TIME, WIDTH } from './click-event-constant';

@Component({
    selector: 'app-click-event',
    templateUrl: './click-event.component.html',
    styleUrls: ['./click-event.component.scss'],
})
export class ClickEventComponent implements OnInit {
    @Input() differenceArray: number[][];
    @Input() id: number;
    @Input() original: string;
    @Output() incrementScore: EventEmitter<number> = new EventEmitter<number>();
    timeout: boolean;
    lastDifferenceClicked: number[];
    currentScore: number = 0;

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
        let x = Math.floor(e.clientX - rect.left);
        if (x < 0) {
            x = 0;
        }
        let y = Math.floor(e.clientY - rect.top);
        if (y < 0) {
            y = 0;
        }
        return new Array(x, y);
    }

    isDifferent(e: MouseEvent, differenceArray: number[][]): boolean {
        if (this.isADifference(differenceArray, this.getCoordInImage(e)[0], this.getCoordInImage(e)[1], false)) {
            this.differenceEffect();
            this.isADifference(differenceArray, this.getCoordInImage(e)[0], this.getCoordInImage(e)[1], true);
            return true;
        } else {
            return false;
        }
    }

    deleteDifference() {}

    // TODO : Add effect, color the same thing on the other canvas and make sure the difference is deleted from the list so you can't click it twice
    differenceEffect() {
        const originalCanvas = document.getElementById('original') as HTMLCanvasElement;
        const originalContext = originalCanvas.getContext('2d') as CanvasRenderingContext2D;
        const differentCanvas = document.getElementById('different') as HTMLCanvasElement;
        const differentContext = differentCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.emitSound();
        for (const pixel of this.lastDifferenceClicked) {
            const pos: number[] = this.positionToPixel(pixel);
            originalContext.fillStyle = '#F00';
            originalContext.fillRect(pos[0], pos[1], 1, 1);
            differentContext.fillStyle = '#F00';
            differentContext.fillRect(pos[0], pos[1], 1, 1);
        }

        this.currentScore += 1;
        this.incrementScore.emit(this.currentScore);
    }

    positionToPixel(toTransform: number) {
        let yCounter = 0;

        while (toTransform >= 640) {
            toTransform -= 640;
            if (toTransform >= 0) {
                yCounter += 1;
            }
        }
        return [toTransform, yCounter];
    }

    isADifference(array: number[][], x: number, y: number, remove: boolean): boolean {
        const posToCheck = y * 640 + x;
        for (const difference of array) {
            console.log('here');
            for (const positions of difference) {
                if (positions === posToCheck) {
                    if (!remove) {
                        this.lastDifferenceClicked = difference;
                        return true;
                    } else if (remove) {
                        const index = array.indexOf(difference);
                        array.splice(index, 1);
                    }
                }
            }
        }
        return false;
    }

    emitSound(): void {
        const sound = new Audio('/assets/ding.mp3');
        sound.play();
    }

    displayError(e: MouseEvent): void {
        if (this.timeout) {
            if (!this.isDifferent(e, this.differenceArray)) {
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
                    context.clearRect(0, 0, WIDTH, HEIGHT); // TODO : check if any way to not use that
                    this.timeout = true;
                }, WAIT_TIME);
            }
        }
    }
}
