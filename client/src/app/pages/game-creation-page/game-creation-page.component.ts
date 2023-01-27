import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit {
    constructor() {}

    getFileInfo(e: Event) {
        const target = e.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result as string;
            img.onload = () => {
                console.log(img.naturalWidth, img.naturalHeight);
            };
        };
    }

    ngOnInit(): void {}
}
