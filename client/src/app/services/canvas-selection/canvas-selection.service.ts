import { Injectable } from '@angular/core';
import { CanvasInformations } from '@common/canvas-informations';

@Injectable({
    providedIn: 'root',
})
export class CanvasSelectionService {
    canvasInformations: CanvasInformations;

    setProperties(information: CanvasInformations) {
        this.canvasInformations = information;
    }

    pushCanvas(canvas: HTMLCanvasElement) {
        this.canvasInformations.nbElements++;
        // if (this.nbElements < this.actionsArray.length) {
        //     // added this to make sure that if someone undos then adds new modifications
        //     // that it won't allow user to undo back to the old saved canvases
        //     this.actionsArray.length = this.nbElements;
        // }

        const canvasDataURL = canvas.toDataURL();
        if (this.canvasInformations.isInOriginalCanvas) {
            // if (this.isFirstTimeInLeftCanvas) this.verifyFirstTime('left');
            this.canvasInformations.actionsArray.push(true);
            this.canvasInformations.leftArrayPointer++;
            this.canvasInformations.leftCanvasArray.push(canvasDataURL);
        } else {
            this.canvasInformations.actionsArray.push(false);
            this.canvasInformations.rightArrayPointer++;
            this.canvasInformations.rightCanvasArray.push(canvasDataURL);
            // if (this.isFirstTimeInRightCanvas) this.verifyFirstTime('right');
        }
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
