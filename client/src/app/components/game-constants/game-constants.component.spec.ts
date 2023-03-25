import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameConstantsComponent } from './game-constants.component';

describe('GameConstantsComponent', () => {
  let component: GameConstantsComponent;
  let fixture: ComponentFixture<GameConstantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameConstantsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameConstantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
