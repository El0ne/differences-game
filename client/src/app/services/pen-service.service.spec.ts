// import { ElementRef } from '@angular/core';
// import { TestBed } from '@angular/core/testing';
// import { Attributes } from '@app/pages/game-creation-page/game-creation-page.component';
// import { PenService } from './pen-service.service';

// describe('PenService', () => {
//     let service: PenService;
//     const mockAttributes: Attributes = {
//         ogDrawnCanvas: {} as ElementRef,
//         diffDrawnCanvas: {} as ElementRef,
//         ogRectCanvas: {} as ElementRef,
//         diffRectCanvas: {} as ElementRef,
//     };
//     const mockOgDrawnCanvas = {} as HTMLCanvasElement;
//     const mockDiffDrawnCanvas = {} as HTMLCanvasElement;
//     const mockOgRectCanvas = {} as HTMLCanvasElement;
//     const mockDiffRectCanvas = {} as HTMLCanvasElement;

//     beforeEach(() => {
//         TestBed.configureTestingModule({});
//         service = TestBed.inject(PenService);
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     it('should set attributes', () => {
//         service.setAttributes(mockAttributes);
//         expect(service.ogDrawnCanvas).toEqual(mockAttributes.ogDrawnCanvas);
//         expect(service.diffDrawnCanvas).toEqual(mockAttributes.diffDrawnCanvas);
//         expect(service.ogRectCanvas).toEqual(mockAttributes.ogRectCanvas);
//         expect(service.diffRectCanvas).toEqual(mockAttributes.diffRectCanvas);
//     });

//     /*
//     it('should chose the correct canvas', () => {
//         const attributes = {
//             ogDrawnCanvas: { nativeElement: mockOgDrawnCanvas } as ElementRef,
//             diffDrawnCanvas: { nativeElement: mockDiffDrawnCanvas } as ElementRef,
//             ogRectCanvas: { nativeElement: mockOgRectCanvas } as ElementRef,
//             diffRectCanvas: { nativeElement: mockDiffRectCanvas } as ElementRef,
//         };
//         service.setAttributes(attributes);

//         const fakeMouseEvent = {
//             target: mockDiffRectCanvas,
//             altKey: false,
//             button: 0,
//             buttons: 1,
//         } as unknown as MouseEvent;

//         service.choseCanvas(fakeMouseEvent);

//         expect(service.isInOgCanvas).toEqual(false);
//         expect(service.drawingCanvas1).toEqual(mockDiffDrawnCanvas);
//         expect(service.drawingCanvas2).toEqual(mockDiffRectCanvas);

//         // console.log('Mock attributes: ', mockAttributes);
//         // console.log('PenService variables: ', service);
//     });
//     */

//     it('should chose the correct canvas', () => {
//         const attributes = {
//             ogDrawnCanvas: { nativeElement: mockOgDrawnCanvas } as ElementRef,
//             diffDrawnCanvas: { nativeElement: mockDiffDrawnCanvas } as ElementRef,
//             ogRectCanvas: { nativeElement: mockOgRectCanvas } as ElementRef,
//             diffRectCanvas: { nativeElement: mockDiffRectCanvas } as ElementRef,
//         };
//         service.setAttributes(attributes);

//         const fakeMouseEvent = {
//             target: mockOgRectCanvas,
//             altKey: false,
//             button: 0,
//             buttons: 1,
//         } as unknown as MouseEvent;

//         service.choseCanvas(fakeMouseEvent);

//         expect(service.isInOgCanvas).toEqual(true);
//         expect(service.drawingCanvas1).toEqual(mockOgDrawnCanvas);
//         expect(service.drawingCanvas2).toEqual(mockOgRectCanvas);

//         // console.log('Mock attributes: ', mockAttributes);
//         // console.log('PenService variables: ', service);
//     });

//     // incomplete test
//     it('should start drawing on the canvas', () => {
//         service.setAttributes(mockAttributes);
//         service.isInOgCanvas = true;
//         const getContextSpy = spyOn(service.drawingCanvas1, 'getContext');
//         const getBoundingClientRectSpy = spyOn(service.drawingCanvas1, 'getBoundingClientRect');
//         const fakeMouseEvent = new MouseEvent('mousedown', { clientX: 25, clientY: 25 });
//         service.startPen(fakeMouseEvent);

//         expect(service.isUserClicking).toEqual(true);
//         expect(getContextSpy).toHaveBeenCalledWith('2d');
//         expect(getBoundingClientRectSpy).toHaveBeenCalled();
//     });

//     it('should add event listeners for mouse events on canvas elements', () => {
//         const mouseDownSpy = jasmine.createSpy('mouseDownSpy');
//         const mouseUpSpy = jasmine.createSpy('mouseUpSpy');
//         const mouseMoveSpy = jasmine.createSpy('mouseMoveSpy');

//         const ogDrawnCanvas = jasmine.createSpyObj('ogDrawnCanvas', ['addEventListener']);
//         const diffDrawnCanvas = jasmine.createSpyObj('diffDrawnCanvas', ['addEventListener']);

//         ogDrawnCanvas.addEventListener.withArgs('mousedown', jasmine.any(Function)).and.callFake(mouseDownSpy);
//         ogDrawnCanvas.addEventListener.withArgs('mouseup', jasmine.any(Function)).and.callFake(mouseUpSpy);
//         ogDrawnCanvas.addEventListener.withArgs('mousemove', jasmine.any(Function)).and.callFake(mouseMoveSpy);

//         diffDrawnCanvas.addEventListener.withArgs('mousedown', jasmine.any(Function)).and.callFake(mouseDownSpy);
//         diffDrawnCanvas.addEventListener.withArgs('mouseup', jasmine.any(Function)).and.callFake(mouseUpSpy);
//         diffDrawnCanvas.addEventListener.withArgs('mousemove', jasmine.any(Function)).and.callFake(mouseMoveSpy);

//         service.ogDrawnCanvas = { nativeElement: ogDrawnCanvas };
//         service.diffDrawnCanvas = { nativeElement: diffDrawnCanvas };

//         service.drawPen();

//         expect(mouseDownSpy).toHaveBeenCalledTimes(2);
//         expect(mouseUpSpy).toHaveBeenCalledTimes(2);
//         expect(mouseMoveSpy).toHaveBeenCalledTimes(2);
//     });

//     it('should remove event listeners for mouse events on canvas elements', () => {
//         const mouseDownSpy = jasmine.createSpy('mouseDownSpy');
//         const mouseUpSpy = jasmine.createSpy('mouseUpSpy');
//         const mouseMoveSpy = jasmine.createSpy('mouseMoveSpy');

//         const ogDrawnCanvas = jasmine.createSpyObj('ogDrawnCanvas', ['removeEventListener']);
//         const diffDrawnCanvas = jasmine.createSpyObj('diffDrawnCanvas', ['removeEventListener']);

//         ogDrawnCanvas.removeEventListener.withArgs('mousedown', jasmine.any(Function)).and.callFake(mouseDownSpy);
//         ogDrawnCanvas.removeEventListener.withArgs('mouseup', jasmine.any(Function)).and.callFake(mouseUpSpy);
//         ogDrawnCanvas.removeEventListener.withArgs('mousemove', jasmine.any(Function)).and.callFake(mouseMoveSpy);

//         diffDrawnCanvas.removeEventListener.withArgs('mousedown', jasmine.any(Function)).and.callFake(mouseDownSpy);
//         diffDrawnCanvas.removeEventListener.withArgs('mouseup', jasmine.any(Function)).and.callFake(mouseUpSpy);
//         diffDrawnCanvas.removeEventListener.withArgs('mousemove', jasmine.any(Function)).and.callFake(mouseMoveSpy);

//         service.ogDrawnCanvas = { nativeElement: ogDrawnCanvas };
//         service.diffDrawnCanvas = { nativeElement: diffDrawnCanvas };

//         service.removingListeners();

//         expect(mouseDownSpy).toHaveBeenCalledTimes(2);
//         expect(mouseUpSpy).toHaveBeenCalledTimes(2);
//         expect(mouseMoveSpy).toHaveBeenCalledTimes(2);
//     });
// });
