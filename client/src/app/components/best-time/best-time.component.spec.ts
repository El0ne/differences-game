import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecondToMinuteService } from '@app/services/second-t o-minute/second-to-minute.service';

import { BestTimeComponent } from './best-time.component';

describe('BestTimeComponent', () => {
    let component: BestTimeComponent;
    let fixture: ComponentFixture<BestTimeComponent>;
    let service: SecondToMinuteService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BestTimeComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(BestTimeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        service = new SecondToMinuteService();
        component = new BestTimeComponent(service);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call the time service', () => {
        const time = 60;
        const expected = '1:00';
        spyOn(service, 'convert').and.returnValue(expected);
        expect(component.timesConverted(time)).toEqual(expected);
        expect(service.convert).toHaveBeenCalled();
    });
});
