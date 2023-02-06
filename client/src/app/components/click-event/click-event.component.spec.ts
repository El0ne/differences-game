import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MOCK_ARRAY } from '@app/pages/solo-view/mock-array';

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

    it('should return correct pixel coordinates when given linear position', () => {
        const postToCheck = 307199;
        const position = component.positionToPixel(postToCheck);
        expect(position).toEqual([639, 479]);
    });

    it('should return true if difference detected', () => {
        const x = 639;
        const y = 479;
        const remove = false;
        const result = component.isADifference(x, y, remove);

        expect(result).toBeTrue();
    });

    it('should remove difference if in remove state is true', () => {
        const x = 639;
        const y = 479;
        const remove = true;
        const result = component.isADifference(x, y, remove);

        expect(component.differenceArray.length).toEqual(1);
        expect(result).toBeTrue();
    });

    it('should return false if difference not detected', () => {
        const x = 320;
        const y = 240;
        const remove = false;
        const result = component.isADifference(x, y, remove);

        expect(result).toBeFalse();
    });

    it('emit sound should call play', () => {
        spyOn(HTMLMediaElement.prototype, 'play');
        component.emitSound();
        expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    it('canvas should be rendered on init with draw image', () => {
        // expect().toHaveBeenCalled();
    });
});
