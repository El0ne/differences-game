import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MESSAGES_LENGTH } from './solo-view-constants';

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

    it('showTextBox attribute should turn to true when toggleTextBox is called and showTextBox is false', () => {
        component.showTextBox = false;
        component.toggleTextBox();
        expect(component.showTextBox).toBeTrue();
    });

    it('showTextBox attribute should turn to false when toggleTextBox is called and showTextBox is true', () => {
        component.showTextBox = true;
        component.toggleTextBox();
        expect(component.showTextBox).toBeFalse();
    });

    it('showErrorMessage attribute should be turned to true if toggleErrorMessage is called and showErrorMessage is false', () => {
        component.showErrorMessage = false;
        component.toggleErrorMessage();
        expect(component.showErrorMessage).toBeTrue();
    });

    it('showErrorMessage attribute should not be turned to false if toggleErrorMessage is called and showErrorMessage is true', () => {
        component.showErrorMessage = true;
        component.toggleErrorMessage();
        expect(component.showErrorMessage).toBeTrue();
    });

    it('showErrorMessage attribute should be turned to false if untoggleErrorMessage is called', () => {
        component.showErrorMessage = true;
        component.untoggleErrorMessage();
        expect(component.showTextBox).toBeFalse();
    });

    it('sendMessage should add message if message is fine', () => {
        component.messageContent = 'test message';
        component.sendMessage();
        expect(component.messages).toContain('test message');
    });

    it('sendMessage should call toggleErrorMessage if message is empty', () => {
        const spy = spyOn(component, 'toggleErrorMessage');

        component.messageContent = '';
        component.sendMessage();
        expect(spy).toHaveBeenCalled();
    });

    it('sendMessage should call toggleErrorMessage if message is too long', () => {
        const spy = spyOn(component, 'toggleErrorMessage');

        const longString = new Array(MESSAGES_LENGTH.maxLength + 2).join('a');

        component.messageContent = longString;
        component.sendMessage();
        expect(spy).toHaveBeenCalled();
    });

    it('sendMessage should call untoggleErrorMessage if errorMessage is too true', () => {
        const spy = spyOn(component, 'untoggleErrorMessage');
        component.showErrorMessage = true;
        component.messageContent = 'test message';

        component.sendMessage();
        expect(spy).toHaveBeenCalled();
    });
});
