import { Injectable } from '@angular/core';
import { CanvasSelectionService } from '@app/services/canvas-selection/canvas-selection.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { CanvasInformations } from '@common/canvas-informations';

@Injectable({
    providedIn: 'root',
})
export class PenService {
    canvasInformations: CanvasInformations;

    constructor(private canvasSelectionService: CanvasSelectionService, private undoRedoService: UndoRedoService) {}

    setColor(color: string): void {
        console.log('hey');
        this.canvasInformations.selectedColor = color;
    }
    setProperties(information: CanvasInformations) {
        this.canvasInformations = information;
    }

    startPen(mouseEvent: MouseEvent) {
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
        const ctx1 = this.canvasInformations.drawingCanvas1.getContext('2d');
        if (ctx1) {
            this.canvasInformations.isUserClicking = false;
            ctx1.beginPath();
        }
        this.undoRedoService.setProperties(this.canvasInformations);
        this.undoRedoService.pushCanvas(this.canvasInformations.drawingCanvas1);
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
        }
    }
}
