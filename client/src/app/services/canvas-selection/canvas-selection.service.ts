import { Injectable } from '@angular/core';
import { CanvasInformations } from '@app/shared/models/canvas-informations';
@Injectable({
    providedIn: 'root',
})
export class CanvasSelectionService {
    canvasInformations: CanvasInformations;

    setProperties(information: CanvasInformations) {
        this.canvasInformations = information;
    }

    choseCanvas(mouseEvent: MouseEvent): void {
        if ([this.canvasInformations.differenceRectangleCanvas, this.canvasInformations.differenceDrawnCanvas].includes(mouseEvent.target)) {
            this.canvasInformations.isInOriginalCanvas = false;
            this.canvasInformations.drawingCanvas1 = this.canvasInformations.differenceDrawnCanvas.nativeElement;
            this.canvasInformations.drawingCanvas2 = this.canvasInformations.differenceRectangleCanvas.nativeElement;
        } else if ([this.canvasInformations.originalRectangleCanvas, this.canvasInformations.originalDrawnCanvas].includes(mouseEvent.target)) {
            this.canvasInformations.isInOriginalCanvas = true;
            this.canvasInformations.drawingCanvas1 = this.canvasInformations.originalDrawnCanvas.nativeElement;
            this.canvasInformations.drawingCanvas2 = this.canvasInformations.originalRectangleCanvas.nativeElement;
        }
    }
}
