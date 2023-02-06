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
        this.timeout = true;
        const tag = this.id.toString();
        const image = new Image();
        image.src = PATHS.temp;
        image.onload = () => {
            const canvas = document.getElementById(tag) as HTMLCanvasElement;
            const context = canvas.getContext('2d') as CanvasRenderingContext2D;
            context.drawImage(image, 0, 0);
        };
    }

    async createCanvas() {
        return new Promise((resolve, reject) => {
            const tag = this.id.toString();
            const image = new Image();
            image.src = PATHS.temp;
            image.onload = () => {
                const canvas = document.getElementById(tag) as HTMLCanvasElement;
                const context = canvas.getContext('2d') as CanvasRenderingContext2D;
                resolve(context.drawImage(image, 0, 0));
            };
            reject(image);
        });
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

    isDifferent(e: MouseEvent): boolean {
        if (this.isADifference(this.getCoordInImage(e)[0], this.getCoordInImage(e)[1], false)) {
            this.differenceEffect();
            this.isADifference(this.getCoordInImage(e)[0], this.getCoordInImage(e)[1], true);
            return true;
        } else {
            return false;
        }
    }

    constructEffect(originalContext: CanvasRenderingContext2D, differentContext: CanvasRenderingContext2D) {
        for (const pixel of this.lastDifferenceClicked) {
            const pos: number[] = this.positionToPixel(pixel);
            originalContext.fillStyle = '#FFD700';
            differentContext.fillStyle = '#FFD700';
            originalContext.fillRect(pos[0], pos[1], 1, 1);
            differentContext.fillRect(pos[0], pos[1], 1, 1);
        }
    }

    destroyEffect(originalContext: CanvasRenderingContext2D, differentContext: CanvasRenderingContext2D) {
        for (const pixel of this.lastDifferenceClicked) {
            const pos: number[] = this.positionToPixel(pixel);
            originalContext.clearRect(pos[0], pos[1], 1, 1);
            differentContext.clearRect(pos[0], pos[1], 1, 1);
        }
    }

    // TODO : Add effect, color the same thing on the other canvas and make sure the difference is deleted from the list so you can't click it twice
    differenceEffect() {
        const originalCanvas = document.getElementById('original') as HTMLCanvasElement;
        const originalContext = originalCanvas.getContext('2d') as CanvasRenderingContext2D;
        const differentCanvas = document.getElementById('different') as HTMLCanvasElement;
        const differentContext = differentCanvas.getContext('2d') as CanvasRenderingContext2D;
        this.emitSound();
        this.constructEffect(originalContext, differentContext);
        const flashIntro = setInterval(() => {
            this.destroyEffect(originalContext, differentContext);
        }, 100);
        const flashOutro = setInterval(() => {
            this.constructEffect(originalContext, differentContext);
        }, 100);

        setTimeout(() => {
            clearInterval(flashIntro);
            clearInterval(flashOutro);
            this.destroyEffect(originalContext, differentContext);
        }, WAIT_TIME);

        this.currentScore += 1;
        this.incrementScore.emit(this.currentScore);
    }

    positionToPixel(toTransform: number) {
        let yCounter = 0;

        while (toTransform >= WIDTH) {
            toTransform -= WIDTH;
            if (toTransform >= 0) {
                yCounter += 1;
            }
        }
        return [toTransform, yCounter];
    }

    isADifference(x: number, y: number, remove: boolean): boolean {
        const posToCheck = y * WIDTH + x;
        for (const difference of this.differenceArray) {
            for (const positions of difference) {
                if (positions === posToCheck) {
                    if (!remove) {
                        this.lastDifferenceClicked = difference;
                        return true;
                    } else if (remove) {
                        const index = this.differenceArray.indexOf(difference);
                        this.differenceArray.splice(index, 1);
                        return true;
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
            if (!this.isDifferent(e)) {
                this.timeout = false;
                const canvas = e.target as HTMLCanvasElement;
                const rect = canvas.getBoundingClientRect();
                const x = Math.floor(e.clientX - rect.left);
                const y = Math.floor(e.clientY - rect.top);
                const context = canvas.getContext('2d') as CanvasRenderingContext2D;
                context.font = '30pt Arial';
                context.fillStyle = 'red';
                context.textAlign = 'center';
                const error = 'Error';
                context.fillText(error, x, y);
                setTimeout(() => {
                    context.clearRect(0, 0, WIDTH, HEIGHT); // TODO : check if any way to not use that
                    this.timeout = true;
                }, WAIT_TIME);
            }
        }
    }
}
