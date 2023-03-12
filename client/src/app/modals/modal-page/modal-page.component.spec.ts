import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ModalPageComponent } from './modal-page.component';

describe('ModalPageComponent', () => {
    let component: ModalPageComponent;
    let fixture: ComponentFixture<ModalPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ModalPageComponent],
            imports: [MatDialogModule, RouterTestingModule],
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
            ],
            teardown: { destroyAfterEach: false },
        }).compileComponents();

        fixture = TestBed.createComponent(ModalPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should close the dialog and move to the configuration page', () => {
        const dialogRefSpyObject = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        const routerSpy = spyOn(TestBed.inject(Router), 'navigate');
        component.matDialogRef = dialogRefSpyObject;

        component.close();

        expect(dialogRefSpyObject.close).toHaveBeenCalled();
        expect(routerSpy).toHaveBeenCalledWith(['/config']);
    });

    it('should close the dialog on destroy', () => {
        const dialogRefSpyObject = jasmine.createSpyObj({ close: null });
        component.matDialogRef = dialogRefSpyObject;

        component.ngOnDestroy();

        expect(dialogRefSpyObject.close).toHaveBeenCalledWith(component.data);
    });
});
