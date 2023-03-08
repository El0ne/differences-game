import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GameConditions } from '@common/chat-dialog-constants';

import { ChosePlayerNameDialogComponent } from './chose-player-name-dialog.component';

describe('ChosePlayerNameDialogComponent', () => {
    let component: ChosePlayerNameDialogComponent;
    let fixture: ComponentFixture<ChosePlayerNameDialogComponent>;
    let matDialogSpy: MatDialogRef<ChosePlayerNameDialogComponent>;
    const data: GameConditions = { game: 'game', multiplayer: true };

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialogRef<ChosePlayerNameDialogComponent>', ['close']);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        matDialogSpy.close = () => {};

        await TestBed.configureTestingModule({
            declarations: [ChosePlayerNameDialogComponent],
            imports: [MatDialogModule, MatIconModule, FormsModule],
            providers: [
                { provide: MatDialogRef, useValue: matDialogSpy },
                { provide: MAT_DIALOG_DATA, useValue: data },
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
        component.validateName();
        expect(component.showNameErrorMessage).toBeFalsy();
    });
});
