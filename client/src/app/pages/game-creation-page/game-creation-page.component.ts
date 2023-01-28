import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    @ViewChild('myDiv') myInput: ElementRef;
    url1 = '';
    url2 = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    uploadOriginal(e: any) {
        if (e.target.files) {
            const reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            reader.onload = (event: any) => {
                this.url1 = event.target.result;
            };
        }
    }
}
