import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { FoundDifferenceService } from '@app/services/found-differences/found-difference.service';
import { PixelModificationService } from '@app/services/pixel-modification/pixel-modification.service';
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

    constructor(
        public clickEventService: ClickEventService,
        public foundDifferenceService: FoundDifferenceService,
        private pixelModService: PixelModificationService,
    ) {}

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
        return this.pixelModService.getCoordInImage(e, rect);
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

    async delay(ms: number) {
        return new Promise((res) => setTimeout(res, ms));
    }

    async clearEffect() {
        const originalContext = this.modification.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        await this.pixelModService.turnOffYellow(originalContext, this.foundDifferenceService.foundDifferences);
    }

    async differenceEffect(currentDifferences: number[]): Promise<void> {
        if (!this.endGame) {
            const originalContext = this.modification.nativeElement.getContext('2d') as CanvasRenderingContext2D;

            this.pixelModService.turnDifferenceYellow(originalContext, currentDifferences);
            await this.delay(FAST_WAIT_TIME_MS);
            this.pixelModService.turnOffYellow(originalContext, currentDifferences);
            await this.delay(FAST_WAIT_TIME_MS);
            this.pixelModService.turnDifferenceYellow(originalContext, currentDifferences);
            await this.delay(FAST_WAIT_TIME_MS);
            this.pixelModService.turnOffYellow(originalContext, currentDifferences);
            await this.delay(FAST_WAIT_TIME_MS);

            if (this.toggleCheatMode) {
                this.differenceEffect(currentDifferences);
            } else {
                this.emitSound(false);
            }
        }
    }

    emitSound(isErrorSound: boolean): void {
        const sound = new Audio();
        if (!isErrorSound) sound.src = 'assets/ding.mp3';
        else sound.src = 'assets/Error.mp3';
        sound.play();
    }

    displayError(e: MouseEvent): void {
        if (!this.timeout && !this.endGame) {
            this.emitSound(true);
            this.timeout = true;
            const rect = this.modification.nativeElement.getBoundingClientRect();
            const context = this.modification.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.pixelModService.errorMessage(e, rect, context);
            setTimeout(() => {
                context.clearRect(0, 0, WIDTH, HEIGHT);
                this.timeout = false;
            }, WAIT_TIME_MS);
        }
    }

    sendDifferencePixels(differenceArray: number[]): ImageData[] {
        const context = this.picture.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        return this.pixelModService.getColorFromDifference(context, differenceArray);
    }

    receiveDifferencePixels(colorArray: ImageData[], positionArray: number[]): void {
        const context = this.picture.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.pixelModService.paintColorFromDifference(colorArray, positionArray, context);
    }
}
