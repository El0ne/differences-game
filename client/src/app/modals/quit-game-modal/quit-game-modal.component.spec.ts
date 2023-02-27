import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuitGameModalComponent } from './quit-game-modal.component';

describe('QuitGameModalComponent', () => {
  let component: QuitGameModalComponent;
  let fixture: ComponentFixture<QuitGameModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuitGameModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuitGameModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
