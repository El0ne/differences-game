import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketService } from '@app/services/socket/socket.service';
import { TimerSoloService } from '@app/services/timer-solo/timer-solo.service';

import { BestTimeComponent } from './best-time.component';

describe('BestTimeComponent', () => {
    let component: BestTimeComponent;
    let fixture: ComponentFixture<BestTimeComponent>;
    let service: TimerSoloService;
    let socket: SocketService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BestTimeComponent],
            teardown: { destroyAfterEach: false },
        }).compileComponents();

        fixture = TestBed.createComponent(BestTimeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        service = new TimerSoloService(socket);
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
