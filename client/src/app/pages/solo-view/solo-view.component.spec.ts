import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoloViewComponent } from './solo-view.component';

describe('SoloViewComponent', () => {
    let component: SoloViewComponent;
    let fixture: ComponentFixture<SoloViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SoloViewComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SoloViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('showTextBox variable should be turned to true when toggleTextBox is called', () => {
        component.toggleTextBox();
        expect(component.showTextBox).toBeTrue();
    });

    it('sendMessage should add message if message is fine', () => {
        component.messageContent = 'test message';
        component.sendMessage();
        expect(component.messages).toContain('test message');
    });

    it('sendMessage should throw error if message is empty', () => {
        const spy = spyOn(window, 'alert').and.callThrough();
        component.messageContent = '';
        component.sendMessage();
        expect(spy).toHaveBeenCalled();
    });
});
