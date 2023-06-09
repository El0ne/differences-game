/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/naming-convention */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { MOCK_ARRAY } from '@app/pages/solo-view/mock-array';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { of, Subject } from 'rxjs';
import { DIFFERENCE_FOUND, DIFFERENCE_NOT_FOUND, TEST_DIFFERENCES } from './click-event-constants-testing';
import { ClickEventComponent } from './click-event.component';

describe('ClickEventComponent', () => {
    let component: ClickEventComponent;
    let fixture: ComponentFixture<ClickEventComponent>;
    let mockService: ClickEventService;
    let expectedClickDifference: Subject<ClickDifferenceVerification>;

    beforeEach(() => {
        mockService = jasmine.createSpyObj('ClickEventService', ['isADifference', 'setDifferences']);
        mockService.isADifference = () => {
            expectedClickDifference.next(DIFFERENCE_FOUND);
            return expectedClickDifference.asObservable();
        };

        mockService.isADifference = () => {
            expectedClickDifference.next(DIFFERENCE_NOT_FOUND);
            return expectedClickDifference.asObservable();
        };

        mockService.getDifferences = () => {
            return of(TEST_DIFFERENCES);
        };

        TestBed.configureTestingModule({
            declarations: [ClickEventComponent],
            imports: [RouterTestingModule, MatIconModule],
            providers: [{ provide: ClickEventService, useValue: mockService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ClickEventComponent);
        component = fixture.componentInstance;
        component.differenceArray = MOCK_ARRAY;
        component.id = 0;
        component.original = 'original';
        component.gameCardId = '1';
        component.imagePath = 'mock-image';

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('emit sound should call play', () => {
        spyOn(HTMLMediaElement.prototype, 'play');
        component.emitSound(true);
        expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    it('emitSound() source should be different depending on input', () => {
        const sound = new Audio();
        spyOn(sound, 'play');
        spyOn(window, 'Audio').and.returnValue(sound);
        component.emitSound(false);
        expect(sound.src.endsWith('/assets/ding.mp3')).toBeTrue();
        component.emitSound(true);
        expect(sound.src.endsWith('/assets/Error.mp3')).toBeTrue();
    });

    it('handleMouseMove should emit properly', () => {
        const emitSpy = spyOn(component.color, 'emit');
        const event = new MouseEvent('mousemove');

        component.handleMouseMove(event);
        expect(emitSpy).toHaveBeenCalled();
    });

    it('getCoordInImage() should reset the position in the y if click is negative', () => {
        const mockClick = new MouseEvent('click', { clientX: 0, clientY: -200 });
        const answer = component.getCoordInImage(mockClick);
        const positionExpected = [0, 0];
        expect(answer[0]).toEqual(positionExpected[0]);
        expect(answer[1]).toEqual(positionExpected[1]);
    });

    it('getCoordInImage() should reset the position in the x if click is negative', () => {
        const mockClick = new MouseEvent('click', { clientX: -200, clientY: 0 });
        const answer = component.getCoordInImage(mockClick);
        const positionExpected = [0, 0];
        expect(answer[0]).toEqual(positionExpected[0]);
        expect(answer[1]).toEqual(positionExpected[1]);
    });

    it('isDifferent() should return true if a difference is detected', () => {
        component.currentPixelHint = 0;
        component.toggleCheatMode = true;
        spyOn(mockService, 'isADifference').and.returnValue(of(DIFFERENCE_FOUND));
        const mockClick = new MouseEvent('click', { clientX: 0, clientY: 0 });
        spyOn(component, 'emitSound').and.callFake(() => {});
        component.isDifferent(mockClick);
        expect(mockService.isADifference).toHaveBeenCalledWith(component.getCoordInImage(mockClick)[0], component.getCoordInImage(mockClick)[1], '1');
        expect(component.differenceData).toEqual(DIFFERENCE_FOUND);
    });

    it('isDifferent() should return false if a difference is not detected', () => {
        component.toggleCheatMode = false;
        spyOn(mockService, 'isADifference').and.returnValue(of(DIFFERENCE_NOT_FOUND));
        const mockClick = new MouseEvent('click', { clientX: 100, clientY: 365 });
        spyOn(component, 'emitSound').and.callFake(() => {});
        component.isDifferent(mockClick);
        expect(mockService.isADifference).toHaveBeenCalledWith(component.getCoordInImage(mockClick)[0], component.getCoordInImage(mockClick)[1], '1');
        expect(component.differenceData).toEqual(DIFFERENCE_NOT_FOUND);
    });

    it('ngOnInit should initialize the elements of the component correctly', () => {
        component.ngOnInit();
        expect(component.timeout).toBeFalsy();
        expect(component.endGame).toBeFalsy();
        expect(component.foundDifferences).toEqual([]);
    });

    it('sendPixels should call getContext', () => {
        const getContextSpy = spyOn(component.picture.nativeElement, 'getContext');

        component.sendDifferencePixels([]);
        expect(getContextSpy).toHaveBeenCalled();
    });

    it('sendPixels should get all pixels inside the difference array', () => {
        const getImageDataSpy = spyOn(CanvasRenderingContext2D.prototype, 'getImageData');
        component.sendDifferencePixels([0, 1, 2, 3]);
        expect(getImageDataSpy).toHaveBeenCalledTimes(4);
    });

    it('receivePixel should call getContext', () => {
        const getContextSpy = spyOn(component.picture.nativeElement, 'getContext');

        component.receiveDifferencePixels([], []);
        expect(getContextSpy).toHaveBeenCalled();
    });

    it('receivePixel should paint all pixels from given position array', () => {
        const fillRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'fillRect');
        const mockImageData = [
            new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1),
            new ImageData(new Uint8ClampedArray([0, 255, 0, 255]), 1, 1),
            new ImageData(new Uint8ClampedArray([0, 0, 255, 255]), 1, 1),
        ];

        component.receiveDifferencePixels(mockImageData, [0, 1, 2]);
        expect(fillRectSpy).toHaveBeenCalledTimes(3);
        expect(fillRectSpy).toHaveBeenCalledWith(0, 0, 1, 1);
        expect(fillRectSpy).toHaveBeenCalledWith(1, 0, 1, 1);
        expect(fillRectSpy).toHaveBeenCalledWith(2, 0, 1, 1);
    });

    it('component should set the properties of the component correctly', () => {
        component.ngOnInit();
        expect(component.toggleCheatMode).toBeFalsy();
        expect(component.timeout).toBeFalsy();
        expect(component.endGame).toBeFalsy();
        expect(component.foundDifferences).toEqual([]);
    });

    it('displayError should only display an error for 1 second', fakeAsync(() => {
        component.timeout = false;
        component.endGame = false;
        const mockClick = new MouseEvent('click', { clientX: 100, clientY: 365 });
        spyOn(component, 'emitSound').and.callFake(() => {});
        const clearRectSpy = spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        const fillTextSpy = spyOn(CanvasRenderingContext2D.prototype, 'fillText');
        component.displayError(mockClick);
        expect(fillTextSpy).toHaveBeenCalled();
        tick(1000);
        expect(clearRectSpy).toHaveBeenCalled();
    }));

    it('differenceEffect() should call differenceEffect if toggleCheatMode is true', async () => {
        component.toggleCheatMode = true;
        component.endGame = false;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        const differenceEffectSpy = spyOn(component, 'differenceEffect').and.callThrough();
        component.differenceEffect([0]);
        expect(differenceEffectSpy).toHaveBeenCalledTimes(1);
    });

    it('clearEffect should get context', async () => {
        const getContextSpy = spyOn(component.modification.nativeElement, 'getContext');

        await component.clearEffect();
        expect(getContextSpy).toHaveBeenCalled();
    });
});
