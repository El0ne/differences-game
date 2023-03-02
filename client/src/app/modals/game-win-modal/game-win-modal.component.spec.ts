import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameWinModalComponent } from './game-win-modal.component';

describe('GameWinModalComponent', () => {
  let component: GameWinModalComponent;
  let fixture: ComponentFixture<GameWinModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameWinModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameWinModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
