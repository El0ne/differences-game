import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { BestTimeComponent } from '@app/components/best-time/best-time.component';
import { GAMES } from '@app/mock/game-cards';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { GameCardInformation } from '@common/game-card';
import { of } from 'rxjs';
import { GameCardSelectionComponent } from './game-card-selection.component';

describe('GameCardSelectionComponent', () => {
    let component: GameCardSelectionComponent;
    let fixture: ComponentFixture<GameCardSelectionComponent>;
    let modalSpy: MatDialog;
    let afterClosedSpy: MatDialogRef<ChosePlayerNameDialogComponent>;

    beforeEach(async () => {
        modalSpy = jasmine.createSpyObj('MatDialog', ['open']);
        afterClosedSpy = jasmine.createSpyObj('MatDialogRef<ChosePlayerNameDialogComponent>', ['afterClosed']);
        afterClosedSpy.afterClosed = () => of('test');
        modalSpy.open = () => afterClosedSpy;

        await TestBed.configureTestingModule({
            declarations: [GameCardSelectionComponent, BestTimeComponent, ChosePlayerNameDialogComponent],
            imports: [MatIconModule, RouterTestingModule],
            providers: [{ provide: MatDialog, useValue: modalSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardSelectionComponent);
        component = fixture.componentInstance;
        component.gameCardInformation = new GameCardInformation();
        component.gameCardInformation = GAMES[0];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('the playerName should be initialized after the modal is closed', () => {
        expect(component.socket.names[0]).toBe('test');
    });
});
