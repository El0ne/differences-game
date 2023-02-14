/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/naming-convention */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { MOCK_ARRAY } from '@app/pages/solo-view/mock-array';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { ClickDifferenceVerification } from '@common/click-difference-verification';
import { of, Subject } from 'rxjs';
import { DIFFERENCE_FOUND, DIFFERENCE_NOT_FOUND, TEST_DIFFERENCES } from './click-event-constants';
import { ClickEventComponent } from './click-event.component';
describe('ClickEventComponent', () => {
    let component: ClickEventComponent;
    let fixture: ComponentFixture<ClickEventComponent>;
    let mockService: ClickEventService;
    let expectedClickDifference: Subject<ClickDifferenceVerification>;
    let expectedDifferences: Subject<number[][]>;

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

        mockService.setDifferences = () => {
            expectedDifferences.next(TEST_DIFFERENCES);
            return expectedDifferences.asObservable();
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

    it('positionToPixel() should return correct pixel coordinates when given linear position', () => {
        const postToCheck = 307199;
        const position = component.positionToPixel(postToCheck);
        expect(position).toEqual([639, 479]);
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

    it('turnDifferenceYellow() should call fillRect() in order to construct flashing effect', () => {
        component.lastDifferenceClicked = [0, 0, 0];
        spyOn(CanvasRenderingContext2D.prototype, 'fillRect');
        component.turnDifferenceYellow(component.modification.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        expect(CanvasRenderingContext2D.prototype.fillRect).toHaveBeenCalledTimes(3);
    });

    it('turnOffYellow() should call clearRect() in order to construct flashing effect', () => {
        component.lastDifferenceClicked = [0, 0, 0, 0, 0];
        spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        component.turnOffYellow(component.modification.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        expect(CanvasRenderingContext2D.prototype.clearRect).toHaveBeenCalledTimes(5);
    });

    it('ngOnInit should initialize the elements of the component correctly', () => {
        const data = [[0], [2]];

        spyOn(mockService, 'setDifferences').and.returnValue(of(data));

        component.ngOnInit();

        expect(mockService.setDifferences).toHaveBeenCalledWith(component.gameCardId);
        expect(component.differenceArray).toEqual(data);
        expect(component.timeout).toBeFalsy();
        expect(component.endGame).toBeFalsy();
        expect(component.foundDifferences).toEqual([]);
    });

    it('sendPixels should call getContext', () => {
        const getContextSpy = spyOn(component.picture.nativeElement, 'getContext');

        component.sendPixels([]);
        expect(getContextSpy).toHaveBeenCalled();
    });

    it('receivePixel should call getContext', () => {
        const getContextSpy = spyOn(component.picture.nativeElement, 'getContext');

        component.receivePixels([], []);
        expect(getContextSpy).toHaveBeenCalled();
    });
});
