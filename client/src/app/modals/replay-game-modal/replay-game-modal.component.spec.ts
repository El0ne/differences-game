import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplayGameModalComponent } from './replay-game-modal.component';

describe('ReplayGameModalComponent', () => {
  let component: ReplayGameModalComponent;
  let fixture: ComponentFixture<ReplayGameModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReplayGameModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplayGameModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
