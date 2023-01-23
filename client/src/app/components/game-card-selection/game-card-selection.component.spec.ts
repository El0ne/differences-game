import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCardSelectionComponent } from './game-card-selection.component';

describe('GameCardSelectionComponent', () => {
    let component: GameCardSelectionComponent;
    let fixture: ComponentFixture<GameCardSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardSelectionComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardSelectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Jouer button should call playSolo() function', () => {
        spyOn(component, 'playSolo');
        const myButton = fixture.debugElement.nativeElement.querySelector("[id='playSolo']");
        myButton.click();
        expect(component.playSolo).toHaveBeenCalled();
    });

    it('Créer button should call playOneVsOne() function', () => {
        spyOn(component, 'playOneVsOne');
        const myButton = fixture.debugElement.nativeElement.querySelector("[id='playOneVsOne']");
        myButton.click();
        expect(component.playOneVsOne).toHaveBeenCalled();
    });

    it('playSolo() function should open soloGame component', () => {
        component.playSolo();
        expect(location.pathname).toBe('/soloGame');
    });

    it('playSOneVsOne() function should open waitingRoom component', () => {
        component.playSolo();
        expect(location.pathname).toBe('/waitingRoom');
    });
});
