import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// use our router instead
constructor(private router: Router) {}

@Injectable({
    providedIn: 'root',
})
export class EndOfGameService {
    constructor() {}

    // to be called when the differencesLeft counter is 0
    endOfGame(differencesLeft: number): boolean {
      // if the differencesLeft counter is 0, the game is over
        if (differencesLeft === 0) {
          // alert the player that they won
            alert('Great work. You won!');
            // stop incrementing the game timer
            const gameTime = document.getElementById('time');
            if (gameTime) {
                const endTime = gameTime.innerHTML;
                gameTime.innerHTML = endTime;
            } else {
                alert('gameTime is undefined');
            }
            // make the game images unclickable
            const gameImages = document.getElementsByClassName('');
            for (let i = 0; i < gameImages.length; i++) {
                gameImages[i].removeEventListener('click', () => {});
            }
            // on alert close, redirect the player to the home page
            router.navigate(['http://localhost:4200/index.html']);
            // return true to indicate that the game is over
            return true;
        } else {
          // return false to indicate that the game is not over
            return false;
        }
    }
}
