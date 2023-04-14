import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GameCardInformation } from '@common/game-card';

import { GameInfoModalComponent } from './game-info-modal.component';

describe('GameInfoModalComponent', () => {
    let component: GameInfoModalComponent;
    let fixture: ComponentFixture<GameInfoModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameInfoModalComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { gameCardInfo: new GameCardInformation(), numberOfDifferences: 1 } },
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: MatDialogRef, useValue: { close: () => {} } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameInfoModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the modal page when calling close', () => {
        const matDialogRefMock = TestBed.inject(MatDialogRef);
        const closeSpy = spyOn(matDialogRefMock, 'close');
        component.close();
        expect(closeSpy).toHaveBeenCalled();
    });
});
