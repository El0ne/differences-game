import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
    let component: HomePageComponent;
    let fixture: ComponentFixture<HomePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HomePageComponent],
            imports: [RouterTestingModule],
        }).compileComponents();

        fixture = TestBed.createComponent(HomePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    /*
    it('should call showClassic on click', () => {
        const spy = spyOn(component, 'showClassic');
        const button = fixture.debugElement.nativeElement.querySelector(By.css('classic'));

        button.click();
        expect(spy).toHaveBeenCalled();
    });
    */

    it('should call showClassic on click', fakeAsync(() => {
        spyOn(component, 'showClassic');

        const button = fixture.debugElement.nativeElement.querySelector("[id='classic']");
        button.click();
        expect(component.showClassic).toHaveBeenCalled();
    }));

    it('should call showLimitedTime on click', fakeAsync(() => {
        spyOn(component, 'showLimitedTime');

        const button = fixture.debugElement.nativeElement.querySelector("[id='limitedTime']");
        button.click();
        expect(component.showLimitedTime).toHaveBeenCalled();
    }));

    it('should call showConfig on click', fakeAsync(() => {
        spyOn(component, 'showConfig');

        const button = fixture.debugElement.nativeElement.querySelector("[id='config']");
        button.click();
        expect(component.showConfig).toHaveBeenCalled();
    }));
});
