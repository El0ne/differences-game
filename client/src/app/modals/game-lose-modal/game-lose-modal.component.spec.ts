import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameLoseModalComponent } from './game-lose-modal.component';

describe('GameLoseModalComponent', () => {
  let component: GameLoseModalComponent;
  let fixture: ComponentFixture<GameLoseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameLoseModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameLoseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
