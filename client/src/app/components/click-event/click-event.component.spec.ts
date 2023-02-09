import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MOCK_ARRAY, TEST_ARRAY } from '@app/pages/solo-view/mock-array';

import { ClickEventComponent } from './click-event.component';

describe('ClickEventComponent', () => {
    let component: ClickEventComponent;
    let fixture: ComponentFixture<ClickEventComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ClickEventComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ClickEventComponent);
        component = fixture.componentInstance;
        component.differenceArray = MOCK_ARRAY;
        component.id = 0;
        component.original = 'original';

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

    it('isADifference() should return true if difference detected', () => {
        const x = 639;
        const y = 479;
        const remove = false;
        const result = component.isADifference(x, y, remove);

        expect(result).toBeTrue();
    });

    it('isADifference() should remove difference if in remove state is true', () => {
        const testComponent = new ClickEventComponent();
        testComponent.differenceArray = TEST_ARRAY;
        testComponent.id = 0;
        testComponent.original = 'original';

        const x = 639;
        const y = 479;
        const remove = true;
        const result = testComponent.isADifference(x, y, remove);

        expect(testComponent.differenceArray.length).toEqual(1);
        expect(result).toBeTrue();
    });

    it('isADifference() should return false if difference not detected', () => {
        const x = 320;
        const y = 240;
        const remove = false;
        const result = component.isADifference(x, y, remove);

        expect(result).toBeFalse();
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

    it('canvas should be rendered on init with draw image', fakeAsync(() => {
        const loadImageSpy = spyOn(component, 'loadImage');
        component.ngOnInit();
        expect(loadImageSpy).toHaveBeenCalled();
    }));

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
        const mockClick = new MouseEvent('click', { clientX: 0, clientY: 0 });
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        spyOn(component, 'emitSound').and.callFake(() => {});
        const result = component.isDifferent(mockClick);
        expect(result).toBeTrue();
    });

    it('isDifferent() should return false if a difference is not deteceted', () => {
        const mockClick = new MouseEvent('click', { clientX: 100, clientY: 365 });
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        spyOn(component, 'emitSound').and.callFake(() => {});
        const result = component.isDifferent(mockClick);
        expect(result).toBeFalse();
    });

    it('constructEffect() should call fillRect() in order to construct flashing effect', () => {
        component.lastDifferenceClicked = [0, 0, 0];
        spyOn(CanvasRenderingContext2D.prototype, 'fillRect');
        component.constructEffect(component.modification.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        expect(CanvasRenderingContext2D.prototype.fillRect).toHaveBeenCalledTimes(3);
    });

    it('destroyEffect() should call clearRect() in order to construct flashing effect', () => {
        component.lastDifferenceClicked = [0, 0, 0, 0, 0];
        spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        component.destroyEffect(component.modification.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        expect(CanvasRenderingContext2D.prototype.clearRect).toHaveBeenCalledTimes(5);
    });

    it('differenceEffect() should display effect at an alternate rate', fakeAsync(() => {
        component.lastDifferenceClicked = [0, 0, 0, 0, 0];
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        spyOn(component, 'emitSound').and.callFake(() => {});
        const constructSpy = spyOn(component, 'constructEffect');
        const destroySpy = spyOn(component, 'destroyEffect');
        component.differenceEffect();
        tick(100);
        fixture.detectChanges();
        expect(constructSpy).toHaveBeenCalled();
        tick(100);
        fixture.detectChanges();
        expect(destroySpy).toHaveBeenCalled();
        tick(100);
        fixture.detectChanges();
        expect(constructSpy).toHaveBeenCalledTimes(4);
        expect(destroySpy).toHaveBeenCalledTimes(3);
        tick(2000);
        fixture.detectChanges();
        expect(destroySpy).toHaveBeenCalledTimes(10);
        expect(constructSpy).toHaveBeenCalledTimes(10);
    }));

    it('displayError() should ignore input if timeout flag is active', () => {
        component.timeout = true;
        const mockClick = new MouseEvent('click', { clientX: 100, clientY: 365 });
        spyOn(CanvasRenderingContext2D.prototype, 'fillRect');
        component.displayError(mockClick);
        expect(CanvasRenderingContext2D.prototype.fillRect).not.toHaveBeenCalled();
        expect(component.timeout).toBeTrue();
    });

    it('displayError() should display error if timeout flag is inactive & should reset flag when timeout over ', fakeAsync(() => {
        component.timeout = false;
        const mockClick = new MouseEvent('click', { clientX: 100, clientY: 365 });
        spyOn(CanvasRenderingContext2D.prototype, 'fillText');
        spyOn(CanvasRenderingContext2D.prototype, 'clearRect');
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        spyOn(component, 'emitSound').and.callFake(() => {});
        component.displayError(mockClick);
        expect(CanvasRenderingContext2D.prototype.fillText).toHaveBeenCalled();
        expect(component.timeout).toBeTrue();
        tick(1000);
        fixture.detectChanges();
        expect(CanvasRenderingContext2D.prototype.clearRect).toHaveBeenCalled();
        expect(component.timeout).toBeFalse();
    }));
});
