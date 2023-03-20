import { Injectable } from '@angular/core';
import { CanvasInformations } from '@common/canvas-informations';
import { CanvasSelectionService } from './canvas-selection/canvas-selection.service';

@Injectable({
    providedIn: 'root',
})
export class PenService {
    canvasInformations: CanvasInformations;

    private penListener: ((MouseEvent: MouseEvent) => void)[] = [this.startPen.bind(this), this.stopPen.bind(this), this.writing.bind(this)];

    constructor(private canvasSelectionService: CanvasSelectionService) {}

    setColor(color: string): void {
        this.canvasInformations.selectedColor = color;
    }
    setProperties(information: CanvasInformations) {
        this.canvasInformations = information;
    }

    startPen(mouseEvent: MouseEvent) {
        // console.log('starting drawing');
        this.canvasInformations.isUserClicking = true;
        const ctx1 = this.canvasInformations.drawingCanvas1.getContext('2d');
        const canvasRect = this.canvasInformations.drawingCanvas1.getBoundingClientRect();

        if (ctx1) {
            ctx1.lineWidth = this.canvasInformations.penSize;
            ctx1.lineCap = 'round';
            ctx1.strokeStyle = this.canvasInformations.selectedColor;
            ctx1.beginPath();
            ctx1.arc(mouseEvent.clientX - canvasRect.left, mouseEvent.clientY - canvasRect.top, 0, 0, 2 * Math.PI);
            ctx1.stroke();
            ctx1.beginPath();
        }
    }

    stopPen() {
        // console.log('stopped writing');
        const ctx1 = this.canvasInformations.drawingCanvas1.getContext('2d');
        if (ctx1) {
            this.canvasInformations.isUserClicking = false;
            ctx1.beginPath();
        }
        // this.savePixels();
        // this.pushCanvas(this.drawingCanvas1);
    }

    writing(mouseEvent: MouseEvent) {
        this.canvasSelectionService.choseCanvas(mouseEvent);
        const ctx1 = this.canvasInformations.drawingCanvas1.getContext('2d');

        if (ctx1 && this.canvasInformations.isUserClicking) {
            const canvasRect = this.canvasInformations.drawingCanvas1.getBoundingClientRect();

            ctx1.lineWidth = this.canvasInformations.penSize;
            ctx1.lineCap = 'round';
            ctx1.strokeStyle = this.canvasInformations.selectedColor;

            ctx1.lineTo(mouseEvent.clientX - canvasRect.left, mouseEvent.clientY - canvasRect.top);
            ctx1.stroke();
            ctx1.beginPath();
            ctx1.moveTo(mouseEvent.clientX - canvasRect.left, mouseEvent.clientY - canvasRect.top);

            // this.drawingActions.push({
            //     position: this.isInOgCanvas,
            //     data: [e.clientX - e.clientY - canvasRect.top],
            // });
        }
    }

    drawPen() {
        // this.penListener = this.startPen.bind(this);
        this.canvasInformations.originalDrawnCanvas.addEventListener('mousedown', this.penListener[0]);
        this.canvasInformations.differenceDrawnCanvas.addEventListener('mousedown', this.penListener[0]);

        // this.penListener = this.stopPen.bind(this);
        this.canvasInformations.originalDrawnCanvas.addEventListener('mouseup', this.penListener[1]);
        this.canvasInformations.differenceDrawnCanvas.addEventListener('mouseup', this.penListener[1]);

        // this.penListener = this.writing.bind(this);
        this.canvasInformations.originalDrawnCanvas.addEventListener('mousemove', this.penListener[2]);
        this.canvasInformations.differenceDrawnCanvas.addEventListener('mousemove', this.penListener[2]);
    }

    // removingListeners() {
    //     this.canvasInformations.originalDrawnCanvas.removeEventListener('mousedown', this.penListener[0]);
    //     this.canvasInformations.differenceDrawnCanvas.removeEventListener('mousedown', this.penListener[0]);
    //     this.canvasInformations.originalDrawnCanvas.removeEventListener('mouseup', this.penListener[1]);
    //     this.canvasInformations.differenceDrawnCanvas.removeEventListener('mouseup', this.penListener[1]);
    //     this.canvasInformations.originalDrawnCanvas.removeEventListener('mousemove', this.penListener[2]);
    //     this.canvasInformations.differenceDrawnCanvas.removeEventListener('mousemove', this.penListener[2]);
    // }
}
