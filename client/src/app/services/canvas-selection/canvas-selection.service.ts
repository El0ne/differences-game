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

    // pushCanvas(canvas: HTMLCanvasElement) {
    //     this.canvasInformations.nbElements++;
    //     // if (this.nbElements < this.actionsArray.length) {
    //     //     // added this to make sure that if someone undos then adds new modifications
    //     //     // that it won't allow user to undo back to the old saved canvases
    //     //     this.actionsArray.length = this.nbElements;
    //     // }

    //     const canvasDataURL = canvas.toDataURL();
    //     if (this.canvasInformations.isInOriginalCanvas) {
    //         // if (this.isFirstTimeInLeftCanvas) this.verifyFirstTime('left');
    //         this.canvasInformations.actionsArray.push(true);
    //         this.canvasInformations.leftArrayPointer++;
    //         this.canvasInformations.leftCanvasArray.push(canvasDataURL);
    //     } else {
    //         this.canvasInformations.actionsArray.push(false);
    //         this.canvasInformations.rightArrayPointer++;
    //         this.canvasInformations.rightCanvasArray.push(canvasDataURL);
    //         // if (this.isFirstTimeInRightCanvas) this.verifyFirstTime('right');
    //     }
    // }

    choseCanvas(mouseEvent: MouseEvent): CanvasInformations {
        const target = mouseEvent.target as HTMLCanvasElement;

        if ([this.canvasInformations.differenceRectangleCanvas, this.canvasInformations.differenceDrawnCanvas].includes(target)) {
            console.log('left');
            this.canvasInformations.isInOriginalCanvas = false;
            this.canvasInformations.drawingCanvas1 = this.canvasInformations.differenceDrawnCanvas;
            this.canvasInformations.drawingCanvas2 = this.canvasInformations.differenceRectangleCanvas;
        } else if ([this.canvasInformations.originalRectangleCanvas, this.canvasInformations.originalDrawnCanvas].includes(target)) {
            console.log('right');
            this.canvasInformations.isInOriginalCanvas = true;
            this.canvasInformations.drawingCanvas1 = this.canvasInformations.originalDrawnCanvas;
            this.canvasInformations.drawingCanvas2 = this.canvasInformations.originalRectangleCanvas;
        }

        return this.canvasInformations;
    }
}
