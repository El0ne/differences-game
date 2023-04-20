import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameLoseModalComponent } from './game-lose-modal.component';

describe('GameLoseModalComponent', () => {
    let component: GameLoseModalComponent;
    let fixture: ComponentFixture<GameLoseModalComponent>;
    let matDialogRefMock: MatDialogRef<GameLoseModalComponent>;
    let routerMock: Router;

    beforeEach(async () => {
        matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            declarations: [GameLoseModalComponent],
            providers: [
                { provide: MatDialogRef, useValue: matDialogRefMock },
                { provide: Router, useValue: routerMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameLoseModalComponent);
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
