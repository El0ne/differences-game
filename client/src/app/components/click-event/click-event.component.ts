import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ClickCommand } from '@app/commands/click/click-command';
import { Command } from '@app/commands/command';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { FoundDifferenceService } from '@app/services/found-differences/found-difference.service';
import { PixelModificationService } from '@app/services/pixel-modification/pixel-modification.service';
import { IMAGE } from '@app/services/server-routes';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { DifferenceInformation } from '@common/difference-information';
import { Observable } from 'rxjs';
import { HEIGHT, WAIT_TIME_MS, WIDTH } from './click-event-constant';

@Component({
    selector: 'app-click-event',
    templateUrl: './click-event.component.html',
    styleUrls: ['./click-event.component.scss'],
})
export class ClickEventComponent implements OnInit, OnChanges {
    @Input() differenceArray: number[][];
    @Input() events: Observable<void>;
    @Input() id: number;
    @Input() original: string;
    @Input() gameCardId: string;
    @Input() imagePath: string;
    @Output() differenceDetected: EventEmitter<DifferenceInformation> = new EventEmitter<DifferenceInformation>();
    @Output() mistake: EventEmitter<void> = new EventEmitter<void>();
    @Output() cheatModeHandler: EventEmitter<KeyboardEvent> = new EventEmitter<KeyboardEvent>();
    @Output() command: EventEmitter<Command> = new EventEmitter<Command>();
    @Output() color: EventEmitter<number[]> = new EventEmitter<number[]>();
    @Output() thirdHint: EventEmitter<boolean> = new EventEmitter<boolean>();
    @ViewChild('picture', { static: true })
    picture: ElementRef<HTMLCanvasElement>;
    @ViewChild('modification', { static: true })
    modification: ElementRef<HTMLCanvasElement>;
    timeout: boolean;
    lastDifferenceClicked: number[];
    differenceData: ClickDifferenceVerification;
    endGame: boolean;
    foundDifferences: number[];
    toggleCheatMode: boolean;
    firstHint: boolean;
    secondHint: boolean;
    hintPosX: number;
    hintPosY: number;
    currentPixelHint: number;

    constructor(
        private clickEventService: ClickEventService,
        public foundDifferenceService: FoundDifferenceService,
        private pixelModificationService: PixelModificationService,
    ) {}

    async ngOnInit(): Promise<void> {
        this.toggleCheatMode = false;
        this.timeout = false;
        this.endGame = false;
        this.firstHint = false;
        this.secondHint = false;
        this.foundDifferences = [];
        this.modification.nativeElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    loadImage(): void {
        const image = new Image();
        image.crossOrigin = 'Anonymous';
        image.src = `${IMAGE}/file/${this.imagePath}`;
        image.onload = () => {
            const context = this.picture.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            context.drawImage(image, 0, 0);
        };
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['imagePath'].currentValue !== changes['imagePath'].previousValue) {
            this.loadImage();
        }
    }

    handleMouseMove(event: MouseEvent): void {
        const rect = this.picture.nativeElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this.color.emit([x, y]);
    }

    getDifferences(id: string): Observable<number[][]> {
        return this.clickEventService.getDifferences(id);
    }

    getCoordInImage(mouseEvent: MouseEvent): number[] {
        const rect = this.modification.nativeElement.getBoundingClientRect();
        const coordinates = this.pixelModificationService.getCoordInImage(mouseEvent, rect);

        return coordinates;
    }

    convertPositionToPixel(toTransform: number): number[] {
        return this.pixelModificationService.positionToPixel(toTransform);
    }

    isDifferent(mouseEvent: MouseEvent): void {
        this.clickEventService
            .isADifference(this.getCoordInImage(mouseEvent)[0], this.getCoordInImage(mouseEvent)[1], this.gameCardId)
            .subscribe((data) => {
                const clickCommand = new ClickCommand(this, data, mouseEvent);
                this.command.emit(clickCommand);
                this.emitToSoloView(data, mouseEvent);
            });
    }

    emitToSoloView(data: ClickDifferenceVerification, mouseEvent: MouseEvent): void {
        this.differenceData = data;
        if (this.differenceData.isADifference && !this.foundDifferenceService.foundDifferences.includes(this.differenceData.differencesPosition)) {
            this.differenceDetected.emit({
                differencesPosition: this.differenceData.differencesPosition,
                lastDifferences: this.differenceData.differenceArray,
            });
            if (this.toggleCheatMode) {
                const keyEvent: KeyboardEvent = new KeyboardEvent('keydown', { key: 't' });
                this.cheatModeHandler.emit(keyEvent);
            }
        } else {
            this.displayError(mouseEvent);
            this.color.emit([this.getCoordInImage(mouseEvent)[0], this.getCoordInImage(mouseEvent)[1]]);
        }
    }

    async clearEffect(): Promise<void> {
        const originalContext = this.modification.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.pixelModificationService.turnOffYellow(originalContext, this.foundDifferenceService.foundDifferences);
    }

    async differenceEffect(currentDifferences: number[]): Promise<void> {
        if (!this.endGame) {
            const originalContext = this.modification.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            await this.pixelModificationService.flashEffect(originalContext, currentDifferences);
            if (this.toggleCheatMode) {
                this.differenceEffect(currentDifferences);
            }
        }
    }

    emitSound(isErrorSound: boolean): void {
        const sound = new Audio();
        if (!isErrorSound) sound.src = 'assets/ding.mp3';
        else sound.src = 'assets/Error.mp3';
        sound.play();
    }

    displayError(click: MouseEvent): void {
        if (!this.timeout && !this.endGame) {
            this.mistake.emit();
            this.emitSound(true);
            this.timeout = true;
            const rect = this.modification.nativeElement.getBoundingClientRect();
            const context = this.modification.nativeElement.getContext('2d') as CanvasRenderingContext2D;
            this.pixelModificationService.errorMessage(click, rect, context);
            setTimeout(() => {
                context.clearRect(0, 0, WIDTH, HEIGHT);
                this.timeout = false;
            }, WAIT_TIME_MS);
        }
    }

    sendDifferencePixels(differenceArray: number[]): ImageData[] {
        const context = this.picture.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        return this.pixelModificationService.getColorFromDifference(context, differenceArray);
    }

    receiveDifferencePixels(colorArray: ImageData[], positionArray: number[]): void {
        const context = this.picture.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.pixelModificationService.paintColorFromDifference(colorArray, positionArray, context);
    }
}
