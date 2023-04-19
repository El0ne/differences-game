import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { LimitedTimeComponent } from '@app/modals/limited-time/limited-time.component';
import { Routes } from '@app/modules/routes';
import { of } from 'rxjs';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
    let component: HomePageComponent;
    let fixture: ComponentFixture<HomePageComponent>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        await TestBed.configureTestingModule({
            declarations: [HomePageComponent],
            imports: [RouterTestingModule, MatDialogModule],
            providers: [{ provide: MatDialog, useValue: dialogSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(HomePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openLimitedTimeDialog should open limited time dialog', () => {
        const dialogRefSpyObject = jasmine.createSpyObj({ afterClosed: of({}), close: null });
        dialogSpy.open.and.returnValue(dialogRefSpyObject);
        component.openLimitedTimeDialog();
        expect(dialogSpy.open).toHaveBeenCalledWith(LimitedTimeComponent);
    });

    it('routes should return routes', () => {
        expect(component.routes.Config).toEqual(Routes.Config);
    });
});
