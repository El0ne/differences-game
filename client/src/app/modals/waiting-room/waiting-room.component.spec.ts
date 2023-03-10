import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketService } from '@app/services/socket/socket.service';

import { WaitingRoomComponent, WaitingRoomDataPassing } from './waiting-room.component';

describe('WaitingRoomComponent', () => {
    let component: WaitingRoomComponent;
    let fixture: ComponentFixture<WaitingRoomComponent>;
    let matDialogSpy: MatDialogRef<WaitingRoomComponent>;
    let socketServiceSpy: SocketService;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialogRef<ChosePlayerNameDialogComponent>', ['close']);
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['names', 'listen', 'delete', 'send'], ['socketId']);
        socketServiceSpy.names = new Map<string, string>();

        await TestBed.configureTestingModule({
            declarations: [WaitingRoomComponent],
            imports: [RouterTestingModule, MatDialogModule],
            providers: [
                { provide: MatDialogRef, useValue: matDialogSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: MAT_DIALOG_DATA, useValue: { stageId: '123', isHost: true } as WaitingRoomDataPassing },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingRoomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect((component.waitingRoomInfo = { stageId: '123', isHost: true }));
    });

    it('test', () => {
        console.log(component.waitingRoomInfo);
    });
});
