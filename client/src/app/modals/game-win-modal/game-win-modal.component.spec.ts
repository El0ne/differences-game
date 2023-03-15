import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EndGame } from '@common/chat-dialog-constants';

import { GameWinModalComponent } from './game-win-modal.component';

describe('GameWinModalComponent', () => {
    let component: GameWinModalComponent;
    let fixture: ComponentFixture<GameWinModalComponent>;
    let matDialogRefMock: MatDialogRef<GameWinModalComponent>;
    let routerMock: Router;
    const data: EndGame = { isSolo: true, winner: 'winner' };

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

    it('should close the modal page', () => {
        component.confirm();
        expect(matDialogRefMock.close).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
    });
});
