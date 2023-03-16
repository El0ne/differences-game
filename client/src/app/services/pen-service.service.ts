import { ElementRef, Injectable, ViewChild } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class PenService {
    @ViewChild('canvas1') myOgCanvas: ElementRef;
    @ViewChild('canvas2') myDiffCanvas: ElementRef;

    @ViewChild('drawingCanvas1') ogDrawnCanvas: ElementRef;
    @ViewChild('drawingCanvas2') diffDrawnCanvas: ElementRef;
    @ViewChild('drawingCanvas3') diffRectCanvas: ElementRef;
    @ViewChild('drawingCanvas4') ogRectCanvas: ElementRef;

    drawingCanvas1: HTMLCanvasElement;
    drawingCanvas2: HTMLCanvasElement;

    isUserClicking: boolean = false;
    color: string = '#ff124f';
    penSize: number = 10;

    canvasArray = new Array();
    drawingActions = new Array();
    nbElements: number = 0;

    isInOgCanvas: boolean = false;

    private penListener: ((e: MouseEvent) => void)[] = [this.startPen.bind(this), this.stopPen.bind(this), this.writing.bind(this)];

    constructor() {}

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

    startPen(e: MouseEvent) {
        // console.log('starting drawing');
        this.isUserClicking = true;
        const ctx1 = this.drawingCanvas1.getContext('2d');
        const canvasRect = this.drawingCanvas1.getBoundingClientRect();

        if (ctx1) {
            ctx1.lineWidth = this.penSize;
            ctx1.lineCap = 'round';
            ctx1.strokeStyle = this.color;
            ctx1.beginPath();
            ctx1.arc(e.clientX - canvasRect.left, e.clientY - canvasRect.top, 0, 0, 2 * Math.PI);
            ctx1.stroke();
            ctx1.beginPath();
        }
    }

    stopPen() {
        // console.log('stopped writing');
        const ctx1 = this.drawingCanvas1.getContext('2d');
        if (ctx1) {
            this.isUserClicking = false;
            ctx1.beginPath();
        }
        // this.savePixels();
        // this.pushCanvas(this.drawingCanvas1);
        const canvas = this.drawingCanvas1;
        this.nbElements++;
        if (this.nbElements < this.canvasArray.length) {
            this.canvasArray.length = this.nbElements; // added this to make sure that if someone undos then adds new modifications that it won't allow user to undo back to the old saved canvases
        }
        const canvasDataURL = canvas.toDataURL();

        this.canvasArray.push(canvasDataURL);
    }

    writing(e: MouseEvent) {
        this.choseCanvas(e);
        const ctx1 = this.drawingCanvas1.getContext('2d');

        if (ctx1 && this.isUserClicking) {
            const canvasRect = this.drawingCanvas1.getBoundingClientRect();

            ctx1.lineWidth = this.penSize;
            ctx1.lineCap = 'round';
            ctx1.strokeStyle = this.color;

            ctx1.lineTo(e.clientX - canvasRect.left, e.clientY - canvasRect.top);
            ctx1.stroke();
            ctx1.beginPath();
            ctx1.moveTo(e.clientX - canvasRect.left, e.clientY - canvasRect.top);

            // this.drawingActions.push({
            //     position: this.isInOgCanvas,
            //     data: [e.clientX - e.clientY - canvasRect.top],
            // });
        }
    }

    drawPen() {
        // this.penListener = this.startPen.bind(this);
        this.ogDrawnCanvas.nativeElement.addEventListener('mousedown', this.penListener[0]);
        this.diffDrawnCanvas.nativeElement.addEventListener('mousedown', this.penListener[0]);

        // this.penListener = this.stopPen.bind(this);
        this.ogDrawnCanvas.nativeElement.addEventListener('mouseup', this.penListener[1]);
        this.diffDrawnCanvas.nativeElement.addEventListener('mouseup', this.penListener[1]);

        // this.penListener = this.writing.bind(this);
        this.ogDrawnCanvas.nativeElement.addEventListener('mousemove', this.penListener[2]);
        this.diffDrawnCanvas.nativeElement.addEventListener('mousemove', this.penListener[2]);
    }

    removingListeners() {
        this.ogDrawnCanvas.nativeElement.removeEventListener('mousedown', this.penListener[0]);
        this.diffDrawnCanvas.nativeElement.removeEventListener('mousedown', this.penListener[0]);
        this.ogDrawnCanvas.nativeElement.removeEventListener('mouseup', this.penListener[1]);
        this.diffDrawnCanvas.nativeElement.removeEventListener('mouseup', this.penListener[1]);
        this.ogDrawnCanvas.nativeElement.removeEventListener('mousemove', this.penListener[2]);
        this.diffDrawnCanvas.nativeElement.removeEventListener('mousemove', this.penListener[2]);
    }
}
