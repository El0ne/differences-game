import { CanvasInformations } from '@common/canvas-informations';

export const getFakeCanvasInformations = (): CanvasInformations => ({
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
    isUserClicking: false,

    penSize: 10,
    eraserSize: 50,

    rectangleInitialX: 0,
    rectangleInitialY: 0,

    selectedColor: '#ff124f',
});
