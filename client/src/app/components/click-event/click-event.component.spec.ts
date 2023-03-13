/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/naming-convention */
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { MOCK_ARRAY } from '@app/pages/solo-view/mock-array';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { PixelModificationService } from '@app/services/pixel-modification/pixel-modification.service';
import { STAGE } from '@app/services/server-routes';
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
            providers: [{ provide: ClickEventService, PixelModificationService, useValue: mockService }],
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

    it('getCoordInImage() should return the correct position', () => {
        const ClientX = 300;
        const ClientY = 100;
        const mockClick = new MouseEvent('click', { clientX: ClientX, clientY: ClientY });
        const rect = component.modification.nativeElement.getBoundingClientRect();
        const answer = component.getCoordInImage(mockClick);
        const positionExpected = [Math.floor(ClientX - rect.left), Math.floor(ClientY - rect.top)];
        expect(answer[0]).toEqual(positionExpected[0]);
        expect(answer[1]).toEqual(positionExpected[1]);
    });

    it('isDifferent() should return true if a difference is detected', () => {
        component.toggleCheatMode = true;
        spyOn(component.clickEventService, 'isADifference').and.returnValue(of(DIFFERENCE_FOUND));
        const mockClick = new MouseEvent('click', { clientX: 0, clientY: 0 });
        spyOn(component, 'emitSound').and.callFake(() => {});
        component.isDifferent(mockClick);
        expect(component.clickEventService.isADifference).toHaveBeenCalledWith(
            component.getCoordInImage(mockClick)[0],
            component.getCoordInImage(mockClick)[1],
            '1',
        );
        expect(component.differenceData).toEqual(DIFFERENCE_FOUND);
    });

    it('isDifferent() should return false if a difference is not detected', () => {
        component.toggleCheatMode = false;
        spyOn(component.clickEventService, 'isADifference').and.returnValue(of(DIFFERENCE_NOT_FOUND));
        const mockClick = new MouseEvent('click', { clientX: 100, clientY: 365 });
        spyOn(component, 'emitSound').and.callFake(() => {});
        component.isDifferent(mockClick);
        expect(component.clickEventService.isADifference).toHaveBeenCalledWith(
            component.getCoordInImage(mockClick)[0],
            component.getCoordInImage(mockClick)[1],
            '1',
        );
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

    it('delay should delay for a given amount of time in ms', fakeAsync(() => {
        const start = Date.now();
        component.delay(100).then(() => {
            const end = Date.now();
            expect(end - start).toBeCloseTo(100, -1);
        });
        tick(100);
    }));

    it('component should draw image on canvas on init', waitForAsync(async () => {
        const imageSpyObj = jasmine.createSpyObj('Image', ['onload']);
        spyOn(window, 'Image').and.returnValue(imageSpyObj);
        spyOn(CanvasRenderingContext2D.prototype, 'drawImage').and.returnValue();

        component.imagePath = 'test.png';
        component.ngOnInit();

        expect(window.Image).toHaveBeenCalledWith();
        expect(imageSpyObj.src).toBe(`${STAGE}/image/test.png`);
        expect(imageSpyObj.crossOrigin).toBe('Anonymous');
        imageSpyObj.onload();
        expect(CanvasRenderingContext2D.prototype.drawImage).toHaveBeenCalled();
    }));

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

    it('clearEffect should get context and call turnOffYellow', () => {
        const getContextSpy = spyOn(component.modification.nativeElement, 'getContext');
        const turnOffYellowSpy = spyOn(component.pixelModificationService, 'turnOffYellow');

        component.clearEffect();

        expect(getContextSpy).toHaveBeenCalled();
        expect(turnOffYellowSpy).toHaveBeenCalled();
    });

    it('differenceEffect() should flash yellow 2 times', async () => {
        const turnYellowSpy = spyOn(component.pixelModificationService, 'turnDifferenceYellow');
        const turnOffYellowSpy = spyOn(component.pixelModificationService, 'turnOffYellow');
        spyOn(component, 'delay').and.callThrough();
        spyOn(component, 'emitSound').and.callFake(() => {});
        await component.differenceEffect([0]);

        expect(turnYellowSpy).toHaveBeenCalledTimes(2);
        expect(turnOffYellowSpy).toHaveBeenCalledTimes(2);
    });

    it('differenceEffect() should call differenceEffect if toggleCheatMode is true', async () => {
        component.toggleCheatMode = true;
        const differenceEffectSpy = spyOn(component, 'differenceEffect');

        await component.differenceEffect([0]);

        expect(differenceEffectSpy).toHaveBeenCalled();
    });

    it('differenceEffect() should call emitSound if toggleCheatMode is false', async () => {
        component.toggleCheatMode = false;
        const emitSoundSpy = spyOn(component, 'emitSound');

        await component.differenceEffect([0]);

        expect(emitSoundSpy).toHaveBeenCalled();
    });
});
