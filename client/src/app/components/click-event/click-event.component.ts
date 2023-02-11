import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ClickEventService } from '@app/services/Click-event/click-event.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { FAST_WAIT_TIME, HEIGHT, WAIT_TIME, WIDTH } from './click-event-constant';

@Component({
    selector: 'app-click-event',
    templateUrl: './click-event.component.html',
    styleUrls: ['./click-event.component.scss'],
})
export class ClickEventComponent implements OnInit {
    @Input() differenceArray: number[][];
    @Input() id: number;
    @Input() original: string;
    @Input() gameCardId: number;
    @Input() radius: number;
    @Output() incrementScore: EventEmitter<number> = new EventEmitter<number>();
    @ViewChild('picture', { static: true })
    picture: ElementRef<HTMLCanvasElement>;
    @ViewChild('modification', { static: true })
    modification: ElementRef<HTMLCanvasElement>;
    timeout: boolean;
    lastDifferenceClicked: number[];
    currentScore: number = 0;
    differenceData: ClickDifferenceVerification;

    constructor(public clickEventService: ClickEventService) {}

    async ngOnInit() {
        this.timeout = false;
        await this.loadImage();
        this.setDifferences();
    }
    async loadImage() {
        return new Promise((resolve) => {
            const image = new Image();
            // TODO: Ajouter lorsqu'on aura acces a GameCardInformation
            image.src = './assets/444-640x480.jpg';
            image.onload = () => {
                const context = this.picture.nativeElement.getContext('2d') as CanvasRenderingContext2D;
                context.drawImage(image, 0, 0);
                resolve(image.height);
            };
        });
    }

    setDifferences() {
        this.clickEventService.setDifferences(this.radius, this.gameCardId).subscribe((data) => {
            this.differenceArray = data;
        });
    }

    getCoordInImage(e: MouseEvent): number[] {
        const rect = this.modification.nativeElement.getBoundingClientRect();
        const x = Math.max(Math.floor(e.clientX - rect.left), 0);
        const y = Math.max(Math.floor(e.clientY - rect.top), 0);
        return new Array(x, y);
    }

    isDifferent(e: MouseEvent) {
        this.clickEventService.isADifference(this.getCoordInImage(e)[0], this.getCoordInImage(e)[1]).subscribe((data) => {
            this.differenceData = data;
            if (this.differenceData.isADifference) {
                this.lastDifferenceClicked = this.differenceData.differenceArray;
                this.differenceEffect();
            } else {
                this.displayError(e);
            }
        });
    }

    constructEffect(originalContext: CanvasRenderingContext2D) {
        for (const pixel of this.lastDifferenceClicked) {
            const pos: number[] = this.positionToPixel(pixel);
            originalContext.fillStyle = '#FFD700';
            originalContext.fillRect(pos[0], pos[1], 1, 1);
        }
    }

    destroyEffect(originalContext: CanvasRenderingContext2D) {
        for (const pixel of this.lastDifferenceClicked) {
            const pos: number[] = this.positionToPixel(pixel);
            originalContext.clearRect(pos[0], pos[1], 1, 1);
        }
    }

    differenceEffect() {
        const originalContext = this.modification.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.emitSound(false);
        this.constructEffect(originalContext);
        const flashIntro = setInterval(() => {
            this.destroyEffect(originalContext);
        }, FAST_WAIT_TIME);
        const flashOutro = setInterval(() => {
            this.constructEffect(originalContext);
        }, FAST_WAIT_TIME);

        setTimeout(() => {
            clearInterval(flashIntro);
            clearInterval(flashOutro);
            this.destroyEffect(originalContext);
        }, WAIT_TIME);

        this.currentScore += 1;
        this.incrementScore.emit(this.currentScore);
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

    emitSound(error: boolean): void {
        const sound = new Audio();
        if (!error) sound.src = '/assets/ding.mp3';
        else sound.src = '/assets/Error.mp3';
        sound.play();
    }

    displayError(e: MouseEvent): void {
        if (!this.timeout) {
            if (!this.differenceData.isADifference) {
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
                }, WAIT_TIME);
            }
        }
    }
}
