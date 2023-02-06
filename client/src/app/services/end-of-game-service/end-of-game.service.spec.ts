import { TestBed } from '@angular/core/testing';

import { EndOfGameService } from './end-of-game.service';

describe('EndOfGameService', () => {
    let service: EndOfGameService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(EndOfGameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return true if the player has found all the differences', () => {
        const gameHasEnded = service.endOfGame(0);
        expect(gameHasEnded).toBeTruthy();
    });

    it('should return false if player has not found all the differences', () => {
        const gameHasEnded = service.endOfGame(3);
        expect(gameHasEnded).toBeFalsy();
    });

    it('gameTime should stop incrementing when the game is over', () => {
        service.endOfGame(0);
        const gameTime = document.getElementById('time');
        const endTime = gameTime.innerHTML;
        tick();
        expect(gameTime.innerHTML).toBe(endTime);
    });

    /*
    it ('image clicks should be ignored when the game is over', () => {
      service.endOfGame(0);
      const image = document.getElementById();
      image.click();
    });
    */

    it('should alert the player when the game is over', () => {
        spyOn(window, 'alert');
        service.endOfGame(0);
        expect(window.alert).toHaveBeenCalledWith('Great work. You won!');
    });

    it('closing the alert should redirect the player to the home page', () => {
        spyOn(window, 'alert');
        window.alert.close();
        expect(window.location.href).toBe('http://localhost:4200/index.html');
    });
});
