import { TestBed } from '@angular/core/testing';
import { getFakeCanvasInformations } from '../canvas-informations.constants';
import { CanvasSelectionService } from '../canvas-selection/canvas-selection.service';
import { EraserButtonService } from './eraser-button.service';

describe('EraserButtonService', () => {
    let service: EraserButtonService;
    const mockCanvasSelectionService = jasmine.createSpyObj(['choseCanvas']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: CanvasSelectionService, useValue: mockCanvasSelectionService }],
        });
        service = TestBed.inject(EraserButtonService);
        const fakeCanvasInfo = getFakeCanvasInformations();
        service.setProperties(fakeCanvasInfo);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setColor should update the canvasInformations selectedColor attribute', () => {
        const color = 'ae1426';
        expect(service.canvasInformations.selectedColor).not.toEqual(color);
        service.setColor(color);
        expect(service.canvasInformations.selectedColor).toEqual(color);
    });

    it('setProperties should update the canvasInformations attribute', () => {
        const fakeCanvasInfo = getFakeCanvasInformations();
        service.setProperties(fakeCanvasInfo);
        expect(service.canvasInformations).toEqual(fakeCanvasInfo);
    });

    /*
    it('should chose the correct canvas', () => {
        const attributes = {
            ogDrawnCanvas: { nativeElement: mockOgDrawnCanvas } as ElementRef,
            diffDrawnCanvas: { nativeElement: mockDiffDrawnCanvas } as ElementRef,
            ogRectCanvas: { nativeElement: mockOgRectCanvas } as ElementRef,
            diffRectCanvas: { nativeElement: mockDiffRectCanvas } as ElementRef,
        };
        service.setAttributes(attributes);

        const fakeMouseEvent = {
            target: mockDiffRectCanvas,
            altKey: false,
            button: 0,
            buttons: 1,
        } as unknown as MouseEvent;

        service.choseCanvas(fakeMouseEvent);

        expect(service.isInOgCanvas).toEqual(false);
        expect(service.drawingCanvas1).toEqual(mockDiffDrawnCanvas);
        expect(service.drawingCanvas2).toEqual(mockDiffRectCanvas);

        // console.log('Mock attributes: ', mockAttributes);
        // console.log('PenService variables: ', service);
    });
    */

    // it('should chose the correct canvas', () => {
    //     const attributes = {
    //         ogDrawnCanvas: { nativeElement: mockOgDrawnCanvas } as ElementRef,
    //         diffDrawnCanvas: { nativeElement: mockDiffDrawnCanvas } as ElementRef,
    //         ogRectCanvas: { nativeElement: mockOgRectCanvas } as ElementRef,
    //         diffRectCanvas: { nativeElement: mockDiffRectCanvas } as ElementRef,
    //     };
    //     service.setAttributes(attributes);

    //     const fakeMouseEvent = {
    //         target: mockOgRectCanvas,
    //         altKey: false,
    //         button: 0,
    //         buttons: 1,
    //     } as unknown as MouseEvent;

    //     service.choseCanvas(fakeMouseEvent);

    //     expect(service.isInOgCanvas).toEqual(true);
    //     expect(service.drawingCanvas1).toEqual(mockOgDrawnCanvas);
    //     expect(service.drawingCanvas2).toEqual(mockOgRectCanvas);

    //     // console.log('Mock attributes: ', mockAttributes);
    //     // console.log('PenService variables: ', service);
    // });

    // it('should add event listeners for mouse events on canvas elements', () => {
    //     const mouseDownSpy = jasmine.createSpy('mouseDownSpy');
    //     const mouseUpSpy = jasmine.createSpy('mouseUpSpy');
    //     const mouseMoveSpy = jasmine.createSpy('mouseMoveSpy');

    //     const ogDrawnCanvas = jasmine.createSpyObj('ogDrawnCanvas', ['addEventListener']);
    //     const diffDrawnCanvas = jasmine.createSpyObj('diffDrawnCanvas', ['addEventListener']);

    //     ogDrawnCanvas.addEventListener.withArgs('mousedown', jasmine.any(Function)).and.callFake(mouseDownSpy);
    //     ogDrawnCanvas.addEventListener.withArgs('mouseup', jasmine.any(Function)).and.callFake(mouseUpSpy);
    //     ogDrawnCanvas.addEventListener.withArgs('mousemove', jasmine.any(Function)).and.callFake(mouseMoveSpy);

    //     diffDrawnCanvas.addEventListener.withArgs('mousedown', jasmine.any(Function)).and.callFake(mouseDownSpy);
    //     diffDrawnCanvas.addEventListener.withArgs('mouseup', jasmine.any(Function)).and.callFake(mouseUpSpy);
    //     diffDrawnCanvas.addEventListener.withArgs('mousemove', jasmine.any(Function)).and.callFake(mouseMoveSpy);

    //     service.ogDrawnCanvas = { nativeElement: ogDrawnCanvas };
    //     service.diffDrawnCanvas = { nativeElement: diffDrawnCanvas };

    //     service.erase();

    //     expect(mouseDownSpy).toHaveBeenCalledTimes(2);
    //     expect(mouseUpSpy).toHaveBeenCalledTimes(2);
    //     expect(mouseMoveSpy).toHaveBeenCalledTimes(2);
    // });

    // it('should remove event listeners for mouse events on canvas elements', () => {
    //     const mouseDownSpy = jasmine.createSpy('mouseDownSpy');
    //     const mouseUpSpy = jasmine.createSpy('mouseUpSpy');
    //     const mouseMoveSpy = jasmine.createSpy('mouseMoveSpy');

    //     const ogDrawnCanvas = jasmine.createSpyObj('ogDrawnCanvas', ['removeEventListener']);
    //     const diffDrawnCanvas = jasmine.createSpyObj('diffDrawnCanvas', ['removeEventListener']);

    //     ogDrawnCanvas.removeEventListener.withArgs('mousedown', jasmine.any(Function)).and.callFake(mouseDownSpy);
    //     ogDrawnCanvas.removeEventListener.withArgs('mouseup', jasmine.any(Function)).and.callFake(mouseUpSpy);
    //     ogDrawnCanvas.removeEventListener.withArgs('mousemove', jasmine.any(Function)).and.callFake(mouseMoveSpy);

    //     diffDrawnCanvas.removeEventListener.withArgs('mousedown', jasmine.any(Function)).and.callFake(mouseDownSpy);
    //     diffDrawnCanvas.removeEventListener.withArgs('mouseup', jasmine.any(Function)).and.callFake(mouseUpSpy);
    //     diffDrawnCanvas.removeEventListener.withArgs('mousemove', jasmine.any(Function)).and.callFake(mouseMoveSpy);

    //     service.ogDrawnCanvas = { nativeElement: ogDrawnCanvas };
    //     service.diffDrawnCanvas = { nativeElement: diffDrawnCanvas };

    //     service.removingListeners();

    //     expect(mouseDownSpy).toHaveBeenCalledTimes(2);
    //     expect(mouseUpSpy).toHaveBeenCalledTimes(2);
    //     expect(mouseMoveSpy).toHaveBeenCalledTimes(2);
    // });
});
