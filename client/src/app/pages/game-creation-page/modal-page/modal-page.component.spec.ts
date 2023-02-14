import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPageComponent } from './modal-page.component';

describe('ModalPageComponent', () => {
    let component: ModalPageComponent;
    let fixture: ComponentFixture<ModalPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ModalPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ModalPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
