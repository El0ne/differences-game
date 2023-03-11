import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { SocketService } from '@app/services/socket/socket.service';

import { HostWaitingRoomComponent } from './host-waiting-room.component';

describe('HostWaitingRoomComponent', () => {
    let component: HostWaitingRoomComponent;
    let fixture: ComponentFixture<HostWaitingRoomComponent>;
    let modalSpy: MatDialogRef<HostWaitingRoomComponent>;
    let socketServiceSpy: SocketService;

    beforeEach(async () => {
        modalSpy = jasmine.createSpyObj('MatDialogRef', ['open']);
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['listen', 'connect', 'send']);

        await TestBed.configureTestingModule({
            declarations: [HostWaitingRoomComponent],
            providers: [
                { provide: MatDialogRef, useValue: modalSpy },
                { provide: SocketService, useValue: socketServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(HostWaitingRoomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
