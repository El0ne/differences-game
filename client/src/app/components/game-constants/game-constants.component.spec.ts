/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { getDefaultGameConstants } from '@common/game-constants';
import { Observable, of } from 'rxjs';

import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GameHistoryComponent } from '@app/components/game-history/game-history.component';
import { ConfirmationModalComponent } from '@app/modals/confirmation-modal/confirmation-modal/confirmation-modal.component';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { SocketService } from '@app/services/socket/socket.service';
import { WAITING_ROOM_EVENTS } from '@common/waiting-room-socket-communication';
import { GameConstantsComponent } from './game-constants.component';

describe('GameConstantsComponent', () => {
    let component: GameConstantsComponent;
    let fixture: ComponentFixture<GameConstantsComponent>;
    let gameConstantsService: GameConstantsService;
    let gameCardService: GameCardInformationService;
    let gameHistoryService: GameHistoryService;
    let modalSpy: jasmine.SpyObj<MatDialog>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmationModalComponent>>;

    let socketServiceSpy: SocketService;

    beforeEach(async () => {
        gameConstantsService = jasmine.createSpyObj('GameConstantsService', ['getGameConstants', 'updateGameConstants']);
        gameConstantsService.getGameConstants = () => {
            return of(getDefaultGameConstants());
        };
        gameConstantsService.updateGameConstants = () => {
            return of();
        };

        gameCardService = jasmine.createSpyObj('GameCardInformationService', ['resetAllBestTimes']);

        gameCardService.resetAllBestTimes = () => {
            return of();
        };

        modalSpy = jasmine.createSpyObj('MatDialog', ['open']);
        // modalSpy.open = () => {
        //     return {
        //         new MatDialogRef()
        //     };
        // };
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);

        gameHistoryService = jasmine.createSpyObj('GameHistoryService', ['deleteGameHistory']);
        gameHistoryService.deleteGameHistory = () => {
            return of();
        };

        socketServiceSpy = jasmine.createSpyObj('SocketService', ['send']);

        await TestBed.configureTestingModule({
            declarations: [GameConstantsComponent],
            imports: [HttpClientTestingModule, FormsModule, MatDialogModule],
            providers: [
                { provide: GameConstantsService, useValue: gameConstantsService },
                { provide: GameCardInformationService, useValue: gameCardService },
                { provide: MatDialog, useValue: modalSpy },
                { provide: GameHistoryService, useValue: gameHistoryService },
                {
                    provide: SocketService,
                    useValue: socketServiceSpy,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameConstantsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameCardService = TestBed.inject(GameCardInformationService) as jasmine.SpyObj<GameCardInformationService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('it should set the game constants on ngOnInit', () => {
        spyOn(gameConstantsService, 'getGameConstants').and.returnValue(of(getDefaultGameConstants()));

        fixture.detectChanges();

        expect(component.gameConstants).toEqual(getDefaultGameConstants());
    });

    it('updateGameConstants() should call updateGameConstants from the service', () => {
        spyOn(gameConstantsService, 'updateGameConstants').and.returnValue(of(undefined));

        component.gameConstants = getDefaultGameConstants();
        component.updateGameConstants();

        expect(gameConstantsService.updateGameConstants).toHaveBeenCalledWith(getDefaultGameConstants());
    });

    it('resetGameConstants() should reset gameConstants call updateGameConstants ', () => {
        spyOn(component, 'updateGameConstants');

        component.gameConstants = {
            countDown: -0,
            hint: -0,
            difference: -0,
        };
        component.resetGameConstants();

        expect(component.gameConstants).toEqual(getDefaultGameConstants());
        expect(component.updateGameConstants).toHaveBeenCalled();
    });

    it('resetAllBestTimes() should call resetAllBestTimes from the service', () => {
        spyOn(gameCardService, 'resetAllBestTimes').and.returnValue(new Observable<void>());

        component.resetAllBestTimes();

        expect(gameCardService.resetAllBestTimes).toHaveBeenCalled();
    });

    it('deleteAllGames() should call socketService when confirmed', () => {
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        modalSpy.open.and.returnValue(dialogRefSpy);

        component.deleteAllGames();

        expect(modalSpy.open).toHaveBeenCalledWith(ConfirmationModalComponent, { data: { message: 'Supprimer toutes les parties?' } });
        expect(socketServiceSpy.send).toHaveBeenCalledWith(WAITING_ROOM_EVENTS.DeleteAllGames);
    });

    it('checkNumber() should return a number between the min and max value for the input', () => {
        const fakeFocusEvent = {
            target: { value: 33 },
        } as unknown as FocusEvent;

        let returnValue = component.checkNumber(fakeFocusEvent, 0, 100);
        expect(returnValue).toEqual(33);

        returnValue = component.checkNumber(fakeFocusEvent, 0, 10);
        expect(returnValue).toEqual(10);

        returnValue = component.checkNumber(fakeFocusEvent, 35, 100);
        expect(returnValue).toEqual(35);
    });

    it('openGameHistory() should open a modal', () => {
        component.openGameHistory();
        expect(modalSpy.open).toHaveBeenCalledWith(GameHistoryComponent);
    });

    it('deleteGameHistory ()should delete game history when confirmed', () => {
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        modalSpy.open.and.returnValue(dialogRefSpy);
        spyOn(gameHistoryService, 'deleteGameHistory').and.returnValue(new Observable());

        component.deleteGameHistory();

        expect(modalSpy.open).toHaveBeenCalledWith(ConfirmationModalComponent, { data: { message: "Supprimer l'historique de partie?" } });

        expect(gameHistoryService.deleteGameHistory).toHaveBeenCalled();
    });
});
