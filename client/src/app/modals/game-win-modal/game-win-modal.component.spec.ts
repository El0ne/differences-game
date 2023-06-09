import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EndGame } from '@common/chat-dialog-constants';

import { GameWinModalComponent } from './game-win-modal.component';

describe('GameWinModalComponent', () => {
    let component: GameWinModalComponent;
    let fixture: ComponentFixture<GameWinModalComponent>;
    let matDialogRefMock: MatDialogRef<GameWinModalComponent>;
    let routerMock: Router;
    const data: EndGame = { isMultiplayer: false, winner: 'winner', isWinner: true };

    beforeEach(async () => {
        matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            declarations: [GameWinModalComponent],
            providers: [
                { provide: MatDialogRef, useValue: matDialogRefMock },
                { provide: Router, useValue: routerMock },
                { provide: MAT_DIALOG_DATA, useValue: data },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameWinModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the modal page and navigate to home when calling confirm', () => {
        component.confirm();
        expect(matDialogRefMock.close).toHaveBeenCalledOnceWith(false);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should close the modal page and set isReplaySelected to true when calling replay', () => {
        component.replay();
        expect(matDialogRefMock.close).toHaveBeenCalledOnceWith(true);
    });
});
