import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GAMES } from '@app/mock/game-cards';

import { GameInfoModalComponent } from './game-info-modal.component';

describe('GameInfoModalComponent', () => {
    let component: GameInfoModalComponent;
    let fixture: ComponentFixture<GameInfoModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameInfoModalComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { gameCardInfo: GAMES[0], numberOfDifferences: 1, numberOfPlayers: 2 } },
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

    it('should receive the proper values from constructor', () => {
        expect(component.gameInfo.gameCardInfo).toEqual(GAMES[0]);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.gameInfo.numberOfDifferences).toBe(1);
        expect(component.gameInfo.numberOfPlayers).toBe(2);
    });
});
