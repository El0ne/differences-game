import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SocketService } from '@app/services/socket/socket.service';

import { ChosePlayerNameDialogComponent } from './chose-player-name-dialog.component';

describe('ChosePlayerNameDialogComponent', () => {
    let component: ChosePlayerNameDialogComponent;
    let fixture: ComponentFixture<ChosePlayerNameDialogComponent>;
    let matDialogSpy: MatDialogRef<ChosePlayerNameDialogComponent>;
    let socketServiceSpy: SocketService;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialogRef<ChosePlayerNameDialogComponent>', ['close']);
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['names'], ['socketId']);
        socketServiceSpy.names = new Map<string, string>();

        await TestBed.configureTestingModule({
            declarations: [ChosePlayerNameDialogComponent],
            imports: [MatDialogModule, MatIconModule, FormsModule],
            providers: [
                { provide: MatDialogRef, useValue: matDialogSpy },
                {
                    provide: SocketService,
                    useValue: socketServiceSpy,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ChosePlayerNameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('validateName should turn nameErrorMessage to true if message is empty', () => {
        component.playerName = '';
        component.validateName();
        expect(component.showNameErrorMessage).toBeTruthy();
    });

    it('validateName should turn nameErrorMessage to false if message is fine', () => {
        component.playerName = 'good name';
        const namesMapSpy = spyOn(socketServiceSpy.names, 'set').and.callThrough();
        // spyOnProperty(socketServiceSpy, 'socketId', 'get').and.returnValue('123');
        // socketServiceSpy.socketId
        component.validateName();
        expect(component.showNameErrorMessage).toBeFalsy();
        expect(namesMapSpy).toHaveBeenCalled();
    });
});
