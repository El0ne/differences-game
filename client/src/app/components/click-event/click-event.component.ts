import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { FoundDifferenceService } from '@app/services/found-differences/found-difference.service';
import { STAGE } from '@app/services/server-routes';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { Observable } from 'rxjs';
import { FAST_WAIT_TIME_MS, HEIGHT, WAIT_TIME_MS, WIDTH } from './click-event-constant';

@Component({
    selector: 'app-click-event',
    templateUrl: './click-event.component.html',
    styleUrls: ['./click-event.component.scss'],
})
export class ClickEventComponent implements OnInit {
    @Input() differenceArray: number[][];
    @Input() events: Observable<void>;
    @Input() id: number;
    @Input() original: string;
    @Input() gameCardId: string;
    @Input() imagePath: string;
    @Output() incrementScore: EventEmitter<number> = new EventEmitter<number>();
    @Output() differences: EventEmitter<number> = new EventEmitter<number>();
    @Output() transmitter: EventEmitter<number[]> = new EventEmitter<number[]>();
    @ViewChild('picture', { static: true })
    picture: ElementRef<HTMLCanvasElement>;
    @ViewChild('modification', { static: true })
    modification: ElementRef<HTMLCanvasElement>;
    timeout: boolean;
    lastDifferenceClicked: number[];
    currentScore: number = 0;
    differenceData: ClickDifferenceVerification;
    endGame: boolean;
    foundDifferences: number[];

    constructor(public clickEventService: ClickEventService, public foundDifferenceService: FoundDifferenceService) {}

    async ngOnInit() {
        this.clickEventService.getDifferences(this.gameCardId).subscribe((data) => {
            this.differenceArray = data;
            this.timeout = false;
            this.endGame = false;
            this.foundDifferences = [];
        });

        await this.loadImage();
    }

    async loadImage() {
        return new Promise((resolve) => {
            const image = new Image();
            image.crossOrigin = 'Anonymous';
            image.src = `${STAGE}/image/${this.imagePath}`;
            image.onload = () => {
                const context = this.picture.nativeElement.getContext('2d') as CanvasRenderingContext2D;
                context.drawImage(image, 0, 0);
                resolve(image.height);
            };
        });
    }

    getCoordInImage(e: MouseEvent): number[] {
        const rect = this.modification.nativeElement.getBoundingClientRect();
        const x = Math.max(Math.floor(e.clientX - rect.left), 0);
        const y = Math.max(Math.floor(e.clientY - rect.top), 0);
        return new Array(x, y);
    }

    isDifferent(e: MouseEvent) {
        this.clickEventService.isADifference(this.getCoordInImage(e)[0], this.getCoordInImage(e)[1], this.gameCardId).subscribe((data) => {
            this.differenceData = data;
            if (
                this.differenceData.isADifference &&
                !this.foundDifferenceService.foundDifferences.includes(this.differenceData.differencesPosition)
            ) {
                this.lastDifferenceClicked = this.differenceData.differenceArray;
                this.differenceEffect();
                this.differences.emit(this.differenceData.differencesPosition);
                this.transmitter.emit(this.lastDifferenceClicked);
            } else {
                this.displayError(e);
            }
        });
    }

    turnDifferenceYellow(originalContext: CanvasRenderingContext2D) {
        for (const pixel of this.lastDifferenceClicked) {
            const pos: number[] = this.positionToPixel(pixel);
            originalContext.fillStyle = '#FFD700';
            originalContext.fillRect(pos[0], pos[1], 1, 1);
        }
    }

    turnOffYellow(originalContext: CanvasRenderingContext2D) {
        for (const pixel of this.lastDifferenceClicked) {
            const pos: number[] = this.positionToPixel(pixel);
            originalContext.clearRect(pos[0], pos[1], 1, 1);
        }
    }

    differenceEffect(): void {
        if (!this.endGame) {
            const originalContext = this.modification.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.emitSound(false);
            this.turnDifferenceYellow(originalContext);
            const flashIntro = setInterval(() => {
                this.turnOffYellow(originalContext);
            }, FAST_WAIT_TIME_MS);
            const flashOutro = setInterval(() => {
                this.turnDifferenceYellow(originalContext);
            }, FAST_WAIT_TIME_MS);

            setTimeout(() => {
                clearInterval(flashIntro);
                clearInterval(flashOutro);
                this.turnOffYellow(originalContext);
            }, WAIT_TIME_MS);

            this.currentScore += 1;
            this.incrementScore.emit(this.currentScore);
        }
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

    emitSound(isErrorSound: boolean): void {
        const sound = new Audio();
        if (!isErrorSound) sound.src = '/assets/ding.mp3';
        else sound.src = '/assets/Error.mp3';
        sound.play();
    }

    displayError(e: MouseEvent): void {
        if (!this.timeout && !this.endGame) {
            this.emitSound(true);
            this.timeout = true;
            const rect = this.modification.nativeElement.getBoundingClientRect();
            const x = Math.floor(e.clientX - rect.left);
            const y = Math.floor(e.clientY - rect.top);
            const context = this.modification.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            context.font = '30pt Arial';
            context.fillStyle = 'red';
            context.textAlign = 'center';
            const error = 'Error';
            context.fillText(error, x, y);

            setTimeout(() => {
                context.clearRect(0, 0, WIDTH, HEIGHT);
                this.timeout = false;
            }, WAIT_TIME_MS);
        }
    }

    sendDifferencePixels(differenceArray: number[]): ImageData[] {
        const context = this.picture.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const colorArray = [];

        for (const position of differenceArray) {
            const pos = this.positionToPixel(position);
            const pixel = context.getImageData(pos[0], pos[1], 1, 1);
            colorArray.push(pixel);
        }
        return colorArray;
    }

    receiveDifferencePixels(colorArray: ImageData[], positionArray: number[]): void {
        const context = this.picture.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        for (let i = 0; i < positionArray.length; i++) {
            const diffPixel = `rgba(${colorArray[i].data[0]},${colorArray[i].data[1]},${colorArray[i].data[2]},${colorArray[i].data[3]})`;
            context.fillStyle = diffPixel;
            const posInPixels = this.positionToPixel(positionArray[i]);
            context.fillRect(posInPixels[0], posInPixels[1], 1, 1);
        }
    }
}
