import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';

import { QuitGameModalComponent } from './quit-game-modal.component';

describe('QuitGameModalComponent', () => {
    let component: QuitGameModalComponent;
    let fixture: ComponentFixture<QuitGameModalComponent>;
    let matDialogRefMock: MatDialogRef<QuitGameModalComponent>;
    let routerMock: Router;
    let mockChatService: SocketService;
    const data = { player: 'player', room: 'testRoom' };

    beforeEach(async () => {
        matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        mockChatService = jasmine.createSpyObj('ChatSocketService', ['send']);

        mockChatService.sio = jasmine.createSpyObj('Socket', ['emit']);
        mockChatService.send = (event: string, value: unknown) => {
            if (value) {
                mockChatService.sio.emit(event, value);
            }
        };

        await TestBed.configureTestingModule({
            declarations: [QuitGameModalComponent],
            providers: [
                { provide: MatDialogRef, useValue: matDialogRefMock },
                { provide: Router, useValue: routerMock },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: data,
                },
                { provide: SocketService, useValue: mockChatService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(QuitGameModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close modal and route to stage-selection page', () => {
        const sendSpy = spyOn(mockChatService, 'send').and.callThrough();
        component.confirm();
        expect(matDialogRefMock.close).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/stage-selection']);
        expect(sendSpy).toHaveBeenCalledWith('abandon', { name: 'player', room: 'testRoom' });
    });

    it('should close modal if close', () => {
        component.cancel();
        expect(matDialogRefMock.close).toHaveBeenCalled();
    });
});
