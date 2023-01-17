import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
    let component: HomePageComponent;
    let fixture: ComponentFixture<HomePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HomePageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(HomePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call showClassic on click', () => {
        const comp = fixture.componentInstance;
        spyOn(comp, 'showClassic');

        const buttonToTest = fixture.debugElement.query(By.css('#classic')).nativeElement;
        buttonToTest.click();
        expect(comp.showClassic).toHaveBeenCalled();
    });
});
