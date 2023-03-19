import { ElementRef, Injectable } from '@angular/core';
import { Attributes } from '@app/pages/game-creation-page/game-creation-page.component';

@Injectable({
    providedIn: 'root',
})
export class EraserButtonService {
    ogDrawnCanvas: ElementRef;
    diffDrawnCanvas: ElementRef;
    ogRectCanvas: ElementRef;
    diffRectCanvas: ElementRef;

    drawingCanvas1: HTMLCanvasElement;
    drawingCanvas2: HTMLCanvasElement;

    isUserClicking: boolean = false;
    eraserSize: number = 50;

    canvasArray = new Array();
    drawingActions = new Array();
    nbElements: number = 0;

    isInOgCanvas: boolean = false;

    private eraseListener: ((e: MouseEvent) => void)[] = [this.startErase.bind(this), this.stopErase.bind(this), this.erasing.bind(this)];

    constructor() {}

    setAttributes(attributes: Attributes) {
        this.ogDrawnCanvas = attributes.ogDrawnCanvas;
        this.diffDrawnCanvas = attributes.diffDrawnCanvas;
        this.ogRectCanvas = attributes.ogRectCanvas;
        this.diffRectCanvas = attributes.diffDrawnCanvas;
        // console.log(this.ogDrawnCanvas);
    }

    choseCanvas(e: MouseEvent) {
        if ([this.diffRectCanvas.nativeElement, this.diffDrawnCanvas.nativeElement].includes(e.target)) {
            // console.log('in diff canvas');
            this.isInOgCanvas = false;
            this.drawingCanvas1 = this.diffDrawnCanvas.nativeElement;
            this.drawingCanvas2 = this.diffRectCanvas.nativeElement;
        } else if ([this.ogRectCanvas.nativeElement, this.ogDrawnCanvas.nativeElement].includes(e.target)) {
            // console.log('in og canvas');
            this.isInOgCanvas = true;
            this.drawingCanvas1 = this.ogDrawnCanvas.nativeElement;
            this.drawingCanvas2 = this.ogRectCanvas.nativeElement;
        }
    }

    startErase(e: MouseEvent) {
        this.isUserClicking = true;
        const ctx1 = this.drawingCanvas1.getContext('2d');

        const canvasRect = this.drawingCanvas1.getBoundingClientRect();

        if (ctx1)
            ctx1.clearRect(
                e.clientX - canvasRect.left - this.eraserSize / 2,
                e.clientY - canvasRect.top - this.eraserSize / 2,
                this.eraserSize,
                this.eraserSize,
            );
    }

    stopErase() {
        this.isUserClicking = false;
        // this.pushCanvas(this.drawingCanvas1);
        const canvas = this.drawingCanvas1;
        this.nbElements++;
        if (this.nbElements < this.canvasArray.length) {
            this.canvasArray.length = this.nbElements; // added this to make sure that if someone undos then adds new modifications that it won't allow user to undo back to the old saved canvases
        }
        const canvasDataURL = canvas.toDataURL();

        this.canvasArray.push(canvasDataURL);
    }

    erasing(e: MouseEvent) {
        this.choseCanvas(e);
        const ctx1 = this.drawingCanvas1.getContext('2d');

        if (ctx1 && this.isUserClicking) {
            const canvasRect = this.drawingCanvas1.getBoundingClientRect();
            ctx1.clearRect(
                e.clientX - canvasRect.left - this.eraserSize / 2,
                e.clientY - canvasRect.top - this.eraserSize / 2,
                this.eraserSize,
                this.eraserSize,
            );
        }
    }

    erase() {
        // this.eraseListener = this.startErase.bind(this);
        this.ogDrawnCanvas.nativeElement.addEventListener('mousedown', this.eraseListener[0]);
        this.diffDrawnCanvas.nativeElement.addEventListener('mousedown', this.eraseListener[0]);

        // this.eraseListener = this.stopErase.bind(this);
        this.ogDrawnCanvas.nativeElement.addEventListener('mouseup', this.eraseListener[1]);
        this.diffDrawnCanvas.nativeElement.addEventListener('mouseup', this.eraseListener[1]);

        // this.eraseListener = this.erasing.bind(this);
        this.ogDrawnCanvas.nativeElement.addEventListener('mousemove', this.eraseListener[2]);
        this.diffDrawnCanvas.nativeElement.addEventListener('mousemove', this.eraseListener[2]);
    }

    removingListeners() {
        this.ogDrawnCanvas.nativeElement.removeEventListener('mousedown', this.eraseListener[0]);
        this.diffDrawnCanvas.nativeElement.removeEventListener('mousedown', this.eraseListener[0]);
        this.ogDrawnCanvas.nativeElement.removeEventListener('mouseup', this.eraseListener[1]);
        this.diffDrawnCanvas.nativeElement.removeEventListener('mouseup', this.eraseListener[1]);
        this.ogDrawnCanvas.nativeElement.removeEventListener('mousemove', this.eraseListener[2]);
        this.diffDrawnCanvas.nativeElement.removeEventListener('mousemove', this.eraseListener[2]);
    }
}
