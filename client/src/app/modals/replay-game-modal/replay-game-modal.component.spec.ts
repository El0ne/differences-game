import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ReplayGameModalComponent } from './replay-game-modal.component';

describe('ReplayGameModalComponent', () => {
    let component: ReplayGameModalComponent;
    let fixture: ComponentFixture<ReplayGameModalComponent>;
    let matDialogRefMock: jasmine.SpyObj<MatDialogRef<ReplayGameModalComponent>>;
    let routerMock: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        matDialogRefMock = jasmine.createSpyObj<MatDialogRef<ReplayGameModalComponent>>('MatDialogRef', ['close']);
        routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [MatIconModule],
            declarations: [ReplayGameModalComponent],
            providers: [
                { provide: MatDialogRef, useValue: matDialogRefMock },
                { provide: Router, useValue: routerMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReplayGameModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the modal and navigate to home page', () => {
        component.confirm();

        expect(matDialogRefMock.close).toHaveBeenCalledWith('quit');
        expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should close the modal', () => {
        component.replay();

        expect(matDialogRefMock.close).toHaveBeenCalledWith('replay');
    });
});
