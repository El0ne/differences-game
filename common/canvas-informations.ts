export interface CanvasInformations {
    differenceRectangleCanvas: HTMLCanvasElement;
    differenceDrawnCanvas: HTMLCanvasElement;

    originalRectangleCanvas: HTMLCanvasElement;
    originalDrawnCanvas: HTMLCanvasElement;

    drawingCanvas1: HTMLCanvasElement;
    drawingCanvas2: HTMLCanvasElement;

    isInOriginalCanvas: boolean;

    rightCanvasArray: string[];
    leftCanvasArray: string[];
    actionsArray: boolean[];
    nbElements: number;
    leftArrayPointer: number;
    rightArrayPointer: number;
    isFirstTimeInRightCanvas: boolean;
    isFirstTimeInLeftCanvas: boolean;

    isRectangleEnabled: boolean;
    isPenEnabled: boolean;
    isEraserEnabled: boolean;
    isDuplicateEnabled: boolean;
    isClearEnabled: boolean;
    isUserClicking: boolean;

    rectangleInitialX: number;
    rectangleInitialY: number;

    selectedColor: string;
    penSize: number;
    eraserSize: number;
}
