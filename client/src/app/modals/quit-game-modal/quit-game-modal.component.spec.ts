import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { QuitGameModalComponent } from './quit-game-modal.component';

describe('QuitGameModalComponent', () => {
    let component: QuitGameModalComponent;
    let fixture: ComponentFixture<QuitGameModalComponent>;
    let matDialogRefMock: MatDialogRef<QuitGameModalComponent>;
    let routerMock: Router;

    beforeEach(async () => {
        matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
        routerMock = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [QuitGameModalComponent],
            providers: [
                { provide: MatDialogRef, useValue: matDialogRefMock },
                { provide: Router, useValue: routerMock },
            ],
        }).compileComponents();

        // router = TestBed.inject(Router);

        fixture = TestBed.createComponent(QuitGameModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close modal and route to stage-selection page', () => {
        component.confirm();
        expect(matDialogRefMock.close).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/stage-selection']);
    });

    it('should close modal if close', () => {
        component.cancel();
        expect(matDialogRefMock.close).toHaveBeenCalled();
    });
});
