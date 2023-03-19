/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TestBed } from '@angular/core/testing';
import { CanvasInformations } from '@common/canvas-informations';

import { DrawManipulationService } from './draw-manipulation.service';

describe('DrawManipulationService', () => {
    let service: DrawManipulationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawManipulationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('setProperties should update the canvasInformations attribute', () => {
        const fakeCanvasInfo = getFakeCanvasInformations();
        service.setProperties(fakeCanvasInfo);
        expect(service.canvasInformations).toEqual(fakeCanvasInfo);
    });

    it('should invert the canvas', () => {
        // Draw something on the canvas before inverting
        const fakeCanvasInfo = getFakeCanvasInformations();
        service.setProperties(fakeCanvasInfo);
        const size = 10;
        const originalDrawingContext = service.canvasInformations.originalDrawnCanvas.getContext('2d');
        originalDrawingContext!.fillStyle = 'ffffff';
        originalDrawingContext!.fillRect(0, 0, size, size);

        const differenceDrawingContext = service.canvasInformations.differenceDrawnCanvas.getContext('2d');
        differenceDrawingContext!.fillStyle = '000000';
        differenceDrawingContext!.fillRect(0, 0, size, size);

        const originalData = originalDrawingContext!.getImageData(0, 0, size, size);
        const differenceData = originalDrawingContext!.getImageData(0, 0, size, size);

        service.invert();

        const originalDrawingImageData = originalDrawingContext!.getImageData(0, 0, size, size);
        const differenceDrawingImageData = differenceDrawingContext!.getImageData(0, 0, size, size);

        expect(originalDrawingImageData.data).toEqual(differenceData!.data);
        expect(differenceDrawingImageData.data).toEqual(originalData!.data);
    });
    it('duplicate should call drawImage with differenceDrawing if it is defined and side is right', () => {
        const differenceCanvasMock = document.createElement('canvas');
        spyOn(differenceCanvasMock.getContext('2d')!, 'drawImage');

        const fakeInfos = getFakeCanvasInformations();
        fakeInfos.differenceDrawnCanvas = differenceCanvasMock;

        service.setProperties(fakeInfos);
        service.duplicate('right');

        expect(differenceCanvasMock.getContext('2d')).not.toBeNull();
        expect(differenceCanvasMock.getContext('2d')!.drawImage).toHaveBeenCalled();
    });

    it('duplicate should call drawImage with differenceDrawing if it is defined and side is left', () => {
        const originalCanvasMock = document.createElement('canvas');
        spyOn(originalCanvasMock.getContext('2d')!, 'drawImage');

        const fakeInfos = getFakeCanvasInformations();
        fakeInfos.originalDrawnCanvas = originalCanvasMock;

        service.setProperties(fakeInfos);
        service.duplicate('left');

        expect(originalCanvasMock.getContext('2d')).not.toBeNull();
        expect(originalCanvasMock.getContext('2d')!.drawImage).toHaveBeenCalled();
    });
});
// TODO create a file for fake canvas informations
const getFakeCanvasInformations = (): CanvasInformations => ({
    differenceRectangleCanvas: document.createElement('canvas'),
    differenceDrawnCanvas: document.createElement('canvas'),

    originalRectangleCanvas: document.createElement('canvas'),
    originalDrawnCanvas: document.createElement('canvas'),

    drawingCanvas1: document.createElement('canvas'),
    drawingCanvas2: document.createElement('canvas'),

    isInOriginalCanvas: true,

    rightCanvasArray: [],
    leftCanvasArray: [],
    actionsArray: [],
    nbElements: 0,
    leftArrayPointer: 0,
    rightArrayPointer: 0,
    isFirstTimeInLeftCanvas: true,
    isFirstTimeInRightCanvas: true,
    isRectangleEnabled: false,
    isPenEnabled: false,
    isEraserEnabled: false,
    isDuplicateEnabled: false,
    isClearEnabled: false,
    isUserClicking: false,

    rectangleInitialX: 0,
    rectangleInitialY: 0,

    selectedColor: '#ff124f',
});
