import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { FoundDifferenceService } from '@app/services/found-differences/found-difference.service';
import { STAGE } from '@app/services/server-routes';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { differenceInformation } from '@common/difference-information';
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
    @Output() handler: EventEmitter<differenceInformation> = new EventEmitter<differenceInformation>();
    @Output() cheatModeHandler: EventEmitter<KeyboardEvent> = new EventEmitter<KeyboardEvent>();
    @ViewChild('picture', { static: true })
    picture: ElementRef<HTMLCanvasElement>;
    @ViewChild('modification', { static: true })
    modification: ElementRef<HTMLCanvasElement>;
    timeout: boolean;
    lastDifferenceClicked: number[];
    differenceData: ClickDifferenceVerification;
    endGame: boolean;
    foundDifferences: number[];
    toggleCheatMode: boolean = false;

    constructor(public clickEventService: ClickEventService, public foundDifferenceService: FoundDifferenceService) {}

    async ngOnInit() {
        this.timeout = false;
        this.endGame = false;
        this.foundDifferences = [];

        const image = new Image();
        image.crossOrigin = 'Anonymous';
        image.src = `${STAGE}/image/${this.imagePath}`;
        image.onload = () => {
            const context = this.picture.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            context.drawImage(image, 0, 0);
        };
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
                this.handler.emit({
                    differencesPosition: this.differenceData.differencesPosition,
                    lastDifferences: this.differenceData.differenceArray,
                });
                if (this.toggleCheatMode) {
                    const keyEvent: KeyboardEvent = new KeyboardEvent('keydown', { key: 't' });
                    this.cheatModeHandler.emit(keyEvent);
                }
            } else {
                this.displayError(e);
            }
        });
    }

    turnDifferenceYellow(originalContext: CanvasRenderingContext2D, differences: number[]) {
        for (const pixel of differences) {
            const pos: number[] = this.positionToPixel(pixel);
            originalContext.fillStyle = '#FFD700';
            originalContext.fillRect(pos[0], pos[1], 1, 1);
        }
    }

    turnOffYellow(originalContext: CanvasRenderingContext2D, differences: number[]) {
        for (const pixel of differences) {
            const pos: number[] = this.positionToPixel(pixel);
            originalContext.clearRect(pos[0], pos[1], 1, 1);
        }
    }

    async delay(ms: number) {
        return new Promise((res) => setTimeout(res, ms));
    }

    async differenceEffect(currentDifferences: number[]): Promise<void> {
        if (!this.endGame) {
            const originalContext = this.modification.nativeElement.getContext('2d') as CanvasRenderingContext2D;

            this.turnDifferenceYellow(originalContext, currentDifferences);
            await this.delay(FAST_WAIT_TIME_MS);
            this.turnOffYellow(originalContext, currentDifferences);
            await this.delay(FAST_WAIT_TIME_MS);
            this.turnDifferenceYellow(originalContext, currentDifferences);
            await this.delay(FAST_WAIT_TIME_MS);
            this.turnOffYellow(originalContext, currentDifferences);
            await this.delay(FAST_WAIT_TIME_MS);
            if (this.toggleCheatMode) {
                console.log('is running');
                this.differenceEffect(currentDifferences);
            } else {
                this.emitSound(false);
                console.log('test');
            }
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
