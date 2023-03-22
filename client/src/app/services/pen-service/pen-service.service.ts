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
        this.canvasInformations.selectedColor = color;
    }
    setProperties(information: CanvasInformations): void {
        this.canvasInformations = information;
    }

    startPen(mouseEvent: MouseEvent): void {
        this.canvasInformations.isUserClicking = true;
        const context = this.canvasInformations.drawingCanvas1.getContext('2d');
        const canvasRect = this.canvasInformations.drawingCanvas1.getBoundingClientRect();

        if (context) {
            context.lineWidth = this.canvasInformations.penSize;
            context.lineCap = 'round';
            context.strokeStyle = this.canvasInformations.selectedColor;
            context.beginPath();
            context.arc(mouseEvent.clientX - canvasRect.left, mouseEvent.clientY - canvasRect.top, 0, 0, 2 * Math.PI);
            context.stroke();
            context.beginPath();
        }
    }

    stopPen(): void {
        const context = this.canvasInformations.drawingCanvas1.getContext('2d');
        if (context) {
            this.canvasInformations.isUserClicking = false;
            context.beginPath();
        }
        this.undoRedoService.setProperties(this.canvasInformations);
        this.undoRedoService.pushCanvas(this.canvasInformations.drawingCanvas1);
    }

    writing(mouseEvent: MouseEvent): void {
        this.canvasSelectionService.choseCanvas(mouseEvent);
        const context = this.canvasInformations.drawingCanvas1.getContext('2d');

        if (context && this.canvasInformations.isUserClicking) {
            const canvasRect = this.canvasInformations.drawingCanvas1.getBoundingClientRect();

            context.lineWidth = this.canvasInformations.penSize;
            context.lineCap = 'round';
            context.strokeStyle = this.canvasInformations.selectedColor;

            context.lineTo(mouseEvent.clientX - canvasRect.left, mouseEvent.clientY - canvasRect.top);
            context.stroke();
            context.beginPath();
            context.moveTo(mouseEvent.clientX - canvasRect.left, mouseEvent.clientY - canvasRect.top);
        }
    }
}
