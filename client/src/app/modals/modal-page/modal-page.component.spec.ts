/* eslint-disable no-underscore-dangle */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { GAMES } from '@app/mock/game-cards';
import { ClickEventService } from '@app/services/click-event/click-event.service';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameCardDto } from '@common/game-card.dto';
import { of } from 'rxjs';

import { ImagesService } from '@app/services/images/images.service';
import { ModalPageComponent } from './modal-page.component';

describe('ModalPageComponent', () => {
    let component: ModalPageComponent;
    let fixture: ComponentFixture<ModalPageComponent>;
    let gameCardService: GameCardInformationService;
    let clickService: ClickEventService;
    let imagesServices: ImagesService;
    let dialogRefSpyObject: MatDialogRef<ModalPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ModalPageComponent],
            imports: [MatDialogModule, RouterTestingModule.withRoutes([{ path: 'config', redirectTo: '' }]), HttpClientTestingModule],
            providers: [
                {
                    provide: MatDialog,
                    useValue: {
                        open: () => ({
                            afterClosed: () => of({}),
                            // eslint-disable-next-line @typescript-eslint/no-empty-function
                            close: () => {},
                        }),
                    },
                },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
                GameCardInformationService,
                ClickEventService,
            ],
            teardown: { destroyAfterEach: false },
        }).compileComponents();

        dialogRefSpyObject = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        fixture = TestBed.createComponent(ModalPageComponent);
        component = fixture.componentInstance;
        component['matDialogRef'] = dialogRefSpyObject;
        fixture.detectChanges();
        gameCardService = TestBed.inject(GameCardInformationService);
        clickService = TestBed.inject(ClickEventService);
        imagesServices = TestBed.inject(ImagesService);
    });

    it('createGame should call create game from service and redirection', () => {
        const redirectionMock = spyOn(component, 'redirection');
        const serviceCreateGameMock = spyOn(gameCardService, 'createGame').and.returnValue(of(GAMES[0]));

        component.createGame();

        expect(serviceCreateGameMock).toHaveBeenCalled();
        expect(redirectionMock).toHaveBeenCalledWith('/config');
    });

    it('drop game should call redirection', () => {
        const redirectionMock = spyOn(component, 'redirection');
        const deleteDifferencesMock = spyOn(clickService, 'deleteDifferences').and.returnValue(of());
        const deleteImagesObjectMock = spyOn(imagesServices, 'deleteImageObjects').and.returnValue(of());

        component['data'] = {
            image: 'string',
            difference: 0,
            difficulty: 'e',
            gameInfo: getFakeGameCardDTO(),
        };
        component.dropGame();

        expect(deleteDifferencesMock).toHaveBeenCalledOnceWith(component['data'].gameInfo._id);
        expect(deleteImagesObjectMock).toHaveBeenCalledOnceWith(component['data'].gameInfo._id);
        expect(redirectionMock).toHaveBeenCalledOnceWith('/creatingGame');
    });

    it('should close the dialog and move to the configuration page when user decides to create game', () => {
        component.createGame();

        expect(dialogRefSpyObject.close).toHaveBeenCalled();
    });

    it('getter should return the good elements', () => {
        component['data'] = {
            image: 'string',
            difference: 0,
            difficulty: 'e',
            gameInfo: getFakeGameCardDTO(),
        };
        expect(component.image).toEqual(component['data'].image);
        expect(component.difference).toEqual(component['data'].difference);
        expect(component.difficulty).toEqual(component['data'].difficulty);
    });
});

const getFakeGameCardDTO = (): GameCardDto => {
    return {
        _id: 'string',
        name: 'string',
        difficulty: 'string',
        radius: 3,
        differenceNumber: 3,
    };
};
