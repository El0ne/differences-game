import { CanvasInformations } from '@common/canvas-informations';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';
// eslint-disable-next-line no-restricted-imports
import { getFakeCanvasInformations } from '../canvas-informations.constants';
import { UndoRedoService } from './undo-redo.service';

describe('UndoRedoService', () => {
    let service: UndoRedoService;
    let canvasInformation: CanvasInformations;

    beforeEach(() => {
        service = new UndoRedoService();
        canvasInformation = getFakeCanvasInformations();
        service.setProperties(canvasInformation);
    });

    it('should push a canvas element to the left array', () => {
        const canvas = document.createElement('canvas');
        service.pushCanvas(canvas);
        expect(canvasInformation.leftCanvasArray.length).toBe(1);
    });

    it('should push a canvas element to the right array', () => {
        const canvas = document.createElement('canvas');
        canvasInformation.isInOriginalCanvas = false;
        service.pushCanvas(canvas);
        expect(canvasInformation.rightCanvasArray.length).toBe(1);
    });

    it('should undo a canvas action', () => {
        const canvas = document.createElement('canvas');
        canvas.width = IMAGE_DIMENSIONS.width;
        canvas.height = IMAGE_DIMENSIONS.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
        }

        service.pushCanvas(canvas);
        service.undo();

        const imageData = canvasInformation.originalDrawnCanvas.getContext('2d')?.getImageData(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);

        expect(imageData).not.toEqual(undefined);
    });

    it('should undo the last action in the left canvas', () => {
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        service.pushCanvas(canvas1);
        service.pushCanvas(canvas2);

        service.undo();
        expect(canvasInformation.nbElements).toBe(1);
        expect(canvasInformation.leftArrayPointer).toBe(1);
        expect(canvasInformation.rightArrayPointer).toBe(0);
        expect(canvasInformation.isInOriginalCanvas).toBeTruthy();
        expect(canvasInformation.rightCanvasArray.length).toBe(0);
        expect(canvasInformation.leftCanvasArray.length).toBe(2);
        expect(canvasInformation.actionsArray.length).toBe(2);
        expect(canvasInformation.leftCanvasArray[1]).toEqual(canvas1.toDataURL());
        expect(canvasInformation.differenceDrawnCanvas.toDataURL()).toEqual(canvas1.toDataURL());
    });

    it('should undo the last action in the right canvas', () => {
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        canvasInformation.isInOriginalCanvas = false;
        service.pushCanvas(canvas1);
        service.pushCanvas(canvas2);

        service.undo();
        expect(canvasInformation.nbElements).toBe(1);
        expect(canvasInformation.leftArrayPointer).toBe(0);
        expect(canvasInformation.rightArrayPointer).toBe(1);
        expect(canvasInformation.isInOriginalCanvas).toBeFalsy();
        expect(canvasInformation.rightCanvasArray.length).toBe(2);
        expect(canvasInformation.leftCanvasArray.length).toBe(0);
        expect(canvasInformation.actionsArray.length).toBe(2);
        expect(canvasInformation.rightCanvasArray[1]).toEqual(canvas1.toDataURL());
        expect(canvasInformation.differenceDrawnCanvas.toDataURL()).toEqual(canvas1.toDataURL());
    });

    it('should redo a canvas action', () => {
        const canvas = document.createElement('canvas');
        canvas.width = IMAGE_DIMENSIONS.width;
        canvas.height = IMAGE_DIMENSIONS.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
        }

        canvasInformation.isInOriginalCanvas = true;
        service.pushCanvas(canvas);
        service.undo();
        service.redo();

        // const imageData = canvasInformation.originalDrawnCanvas.getContext('2d')?.getImageData(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
        // const canvasDataURL = canvasInformation.leftCanvasArray[1];

        // expect(imageData).toEqual(undefined);
        // expect(canvasDataURL).toEqual(canvas.toDataURL());
        expect(canvasInformation.leftArrayPointer).toBe(1);
        expect(canvasInformation.rightArrayPointer).toBe(0);
        expect(canvasInformation.nbElements).toBe(1);
        expect(canvasInformation.rightCanvasArray.length).toBe(0);
    });

    it('should redo the last undone action in the left canvas', () => {
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');

        service.pushCanvas(canvas1);
        service.pushCanvas(canvas2);

        service.undo();

        service.redo();

        expect(canvasInformation.leftArrayPointer).toBe(2);
        expect(canvasInformation.rightArrayPointer).toBe(0);
        expect(canvasInformation.nbElements).toBe(2);
        expect(canvasInformation.leftCanvasArray.length).toBe(2);
        expect(canvasInformation.leftCanvasArray[1]).toEqual(canvas2.toDataURL());
    });

    it('should redo the last undone action in the right canvas', () => {
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        canvasInformation.isInOriginalCanvas = false;
        service.pushCanvas(canvas1);
        service.pushCanvas(canvas2);

        service.undo();

        service.redo();

        expect(canvasInformation.leftArrayPointer).toBe(0);
        expect(canvasInformation.rightArrayPointer).toBe(2);
        expect(canvasInformation.nbElements).toBe(2);
        expect(canvasInformation.rightCanvasArray.length).toBe(2);
        expect(canvasInformation.rightCanvasArray[1]).toEqual(canvas2.toDataURL());
    });
});
