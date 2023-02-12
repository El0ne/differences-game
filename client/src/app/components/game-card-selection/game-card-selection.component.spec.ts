import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { BestTimeComponent } from '@app/components/best-time/best-time.component';
import { GAMES } from '@app/mock/game-cards';
import { IdTransferService } from '@app/services/id-transfer/id-transfer.service';
import { GameCardInformation } from '@common/game-card';

import { GameCardSelectionComponent } from './game-card-selection.component';

describe('GameCardSelectionComponent', () => {
    let component: GameCardSelectionComponent;
    let fixture: ComponentFixture<GameCardSelectionComponent>;
    let service: IdTransferService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardSelectionComponent, BestTimeComponent],
            imports: [MatIconModule],
            providers: [{ provide: IdTransferService }],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardSelectionComponent);
        component = fixture.componentInstance;
        service = jasmine.createSpyObj('IdTransferService', ['setIdFromGameCard']);
        service.setIdFromGameCard = () => {
            return true;
        };
        component.gameCardInformation = new GameCardInformation();
        component.gameCardInformation = GAMES[0];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getId() should set the id of the service from gameCard id', () => {
        const serviceSpy = spyOn(component.idTransferService, 'setIdFromGameCard');
        component.getId();
        expect(serviceSpy).toHaveBeenCalled();
    });
});
