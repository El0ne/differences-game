import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketService } from '@app/services/socket/socket.service';

import { LimitedTimeComponent } from './limited-time.component';

describe('LimitedTimeComponent', () => {
    let component: LimitedTimeComponent;
    let fixture: ComponentFixture<LimitedTimeComponent>;
    let socketServiceSpy: SocketService;

    beforeEach(async () => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['names', 'listen', 'delete', 'send', 'connect'], ['socketId']);
        await TestBed.configureTestingModule({
            declarations: [LimitedTimeComponent],
            imports: [RouterTestingModule, MatDialogModule],
            providers: [{ provide: SocketService, useValue: socketServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(LimitedTimeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
