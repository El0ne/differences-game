import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { GAMES } from '@app/mock/game-cards';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameCardDto } from '@common/game-card.dto';
import { of } from 'rxjs';

import { ModalPageComponent } from './modal-page.component';

describe('ModalPageComponent', () => {
    let component: ModalPageComponent;
    let fixture: ComponentFixture<ModalPageComponent>;
    let gameCardService: GameCardInformationService;
    // let createdGame: Subject<GameCardInformation>;
    let dialogRefSpyObject: MatDialogRef<ModalPageComponent>;
    // let routerSpy: Router;

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
                // { provide: GameCardInformationService, useValue: gameCardServiceMock },
            ],
        }).compileComponents();

        // gameCardServiceMock = jasmine.createSpyObj('GameCardInformationService', ['createGame']);
        // createdGame = new Subject<GameCardInformation>();
        // gameCardServiceMock.createGame = () => {
        //     createdGame.next(GAMES[0]);
        //     return createdGame.asObservable();
        // };
        dialogRefSpyObject = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        // routerSpy = spyOn(TestBed.inject(Router), 'navigate');
        fixture = TestBed.createComponent(ModalPageComponent);
        component = fixture.componentInstance;
        component.matDialogRef = dialogRefSpyObject;
        fixture.detectChanges();
        gameCardService = TestBed.inject(GameCardInformationService);
    });

    // it('should close the dialog and move to the configuration page when user decides to create game', () => {
    //     component.matDialogRef = dialogRefSpyObject;

    //     component.createGame();

    //     expect(dialogRefSpyObject.close).toHaveBeenCalled();
    //     expect(routerSpy).toHaveBeenCalledWith(['/config']);
    // });

    it('should close the dialog on destroy', () => {
        component.matDialogRef = dialogRefSpyObject;

        component.ngOnDestroy();

        expect(dialogRefSpyObject.close).toHaveBeenCalledWith(component.data);
    });

    it('createGame should call create game from service and redirection', () => {
        const redirectionMock = spyOn(component, 'redirection');
        const serviceCreateGameMock = spyOn(gameCardService, 'createGame').and.returnValue(of(GAMES[0]));

        component.createGame();

        expect(serviceCreateGameMock).toHaveBeenCalled();
        expect(redirectionMock).toHaveBeenCalledWith('/config');
    });

    it('deleteImages should call redirection', () => {
        const redirectionMock = spyOn(component, 'redirection');
        const serviceDeleteImageMock = spyOn(gameCardService, 'deleteImage').and.returnValue(of());

        // component.data.gameInfo.baseImage = 'test';
        // component.data.gameInfo.differenceImage = 'tes3';

        // component.deleteImages();
        // expect(serviceDeleteImageMock).toHaveBeenCalledWith(component.data.gameInfo.baseImage);
        // expect(redirectionMock).toHaveBeenCalledWith('/creatingGame');

        // component.data = { gameInfo: { baseImage: 'image1.jpg', differenceImage: 'image2.jpg' } };
        component.data = {
            image: 'string',
            difference: 0,
            difficulty: 'e',
            gameInfo: getFakeGameCardDTO(),
        };
        component.deleteImages();

        expect(serviceDeleteImageMock).toHaveBeenCalledTimes(2);
        expect(serviceDeleteImageMock).toHaveBeenCalledWith(component.data.gameInfo.baseImage);
        expect(serviceDeleteImageMock).toHaveBeenCalledWith(component.data.gameInfo.differenceImage);
        expect(redirectionMock).toHaveBeenCalledTimes(1);
        expect(redirectionMock).toHaveBeenCalledWith('/creatingGame');
    });

    it('should close the dialog and move to the configuration page when user decides to create game', () => {
        component.createGame();

        expect(dialogRefSpyObject.close).toHaveBeenCalled();
        // expect(routerSpy).toHaveBeenCalledWith(['/config']);
    });
});

const getFakeGameCardDTO = (): GameCardDto => {
    return {
        _id: 'string',
        name: 'string',
        difficulty: 'string',
        baseImage: 'string',
        differenceImage: 'string',
        radius: 3,
        differenceNumber: 3,
    };
};
