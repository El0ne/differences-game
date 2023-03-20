import { getFakeCanvasInformations } from '../canvas-informations.constants';
import { UndoRedoService } from './undo-redo.service';

describe('UndoRedoService', () => {
    let service: UndoRedoService;

    const canvasInformation = getFakeCanvasInformations();

    beforeEach(() => {
        service = new UndoRedoService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set canvas properties', () => {
        service.setProperties(canvasInformation);

        expect(service.canvasInformations).toEqual(canvasInformation);
    });

    it('should push the appropriate canvas to the left canvas array', () => {
        const canvas = document.createElement('canvas');

        service.setProperties(canvasInformation);

        service.pushCanvas(canvas);

        expect(service.canvasInformations.leftCanvasArray.length).toEqual(1);
    });

    it('should push canvas to the right canvas array', () => {
        const canvas = document.createElement('canvas');

        canvasInformation.isInOriginalCanvas = false;
        service.setProperties(canvasInformation);

        service.pushCanvas(canvas);

        expect(service.canvasInformations.rightCanvasArray.length).toEqual(1);
    });

    it('should undo action', () => {
        const canvas = document.createElement('canvas');

        service.setProperties(canvasInformation);

        service.pushCanvas(canvas);
        spyOn(service, 'undoAction');

        service.undo();

        expect(service.undoAction).toHaveBeenCalledWith(service.canvasInformations.leftCanvasArray, 0);
        expect(service.canvasInformations.nbElements).toEqual(0);
    });

    it('should redo action', () => {
        const canvas = document.createElement('canvas');
        service.setProperties(canvasInformation);

        service.pushCanvas(canvas);
        service.undo();
        spyOn(service, 'redoAction');

        service.redo();

        expect(service.redoAction).toHaveBeenCalledWith(service.canvasInformations.rightCanvasArray, 0);
        expect(service.canvasInformations.nbElements).toEqual(1);
    });
});
