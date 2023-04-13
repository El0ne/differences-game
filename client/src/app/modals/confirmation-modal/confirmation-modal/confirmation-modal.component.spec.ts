import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationModalComponent } from './confirmation-modal.component';

describe('ConfirmationModalComponent', () => {
    let component: ConfirmationModalComponent;
    let fixture: ComponentFixture<ConfirmationModalComponent>;
    let matDialogRefMock: MatDialogRef<ConfirmationModalComponent>;

    beforeEach(async () => {
        matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
        await TestBed.configureTestingModule({
            declarations: [ConfirmationModalComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { message: 'message' } },
                { provide: MatDialogRef, useValue: matDialogRefMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmationModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the modal page with false when cancel is called', () => {
        component.cancel();
        expect(matDialogRefMock.close).toHaveBeenCalledWith(false);
    });

    it('should close the modal page with true when confirm is called', () => {
        component.confirm();
        expect(matDialogRefMock.close).toHaveBeenCalledWith(true);
    });
});
