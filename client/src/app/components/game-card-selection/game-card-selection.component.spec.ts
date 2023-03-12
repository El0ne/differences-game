/* eslint-disable no-underscore-dangle */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BestTimeComponent } from '@app/components/best-time/best-time.component';
import { GAMES } from '@app/mock/game-cards';
import { ChosePlayerNameDialogComponent } from '@app/modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { WaitingRoomComponent } from '@app/modals/waiting-room/waiting-room.component';
import { GameCardInformation } from '@common/game-card';
import { of } from 'rxjs';
import { GameCardSelectionComponent } from './game-card-selection.component';

describe('GameCardSelectionComponent', () => {
    let component: GameCardSelectionComponent;
    let fixture: ComponentFixture<GameCardSelectionComponent>;
    let modalSpy: MatDialog;
    let choseNameAfterClosedSpy: MatDialogRef<ChosePlayerNameDialogComponent>;
    let waitingRoomAfterClosedSpy: MatDialogRef<ChosePlayerNameDialogComponent>;

    beforeEach(async () => {
        modalSpy = jasmine.createSpyObj('MatDialog', ['open']);
        choseNameAfterClosedSpy = jasmine.createSpyObj('MatDialogRef<ChosePlayerNameDialogComponent>', ['afterClosed']);
        choseNameAfterClosedSpy.afterClosed = () => of(undefined);

        waitingRoomAfterClosedSpy = jasmine.createSpyObj('MatDialogRef<WaitingRoomComponent>', ['afterClosed']);
        waitingRoomAfterClosedSpy.afterClosed = () => of();

        await TestBed.configureTestingModule({
            declarations: [GameCardSelectionComponent, BestTimeComponent, ChosePlayerNameDialogComponent, WaitingRoomComponent],
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

    it('selectPlayerName should redirect to soloview after opening the modal if in soloGame', () => {
        modalSpy.open = () => choseNameAfterClosedSpy;
        const routerSpy = spyOn(TestBed.inject(Router), 'navigate');
        component.selectPlayerName(true);
        expect(routerSpy).toHaveBeenCalledWith(['/soloview/' + component.gameCardInformation._id]);
    });

    it('selectPlayerName should call hostOrJoinGame if in multiplayer', () => {
        modalSpy.open = () => choseNameAfterClosedSpy;
        const spy = spyOn(component, 'hostOrJoinGame').and.stub();
        component.selectPlayerName(false);
        expect(spy).toHaveBeenCalled();
    });
});
