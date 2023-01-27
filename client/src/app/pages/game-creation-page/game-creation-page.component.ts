import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit {
    urlOriginal: string;
    urlDifferent: string;
    constructor() {}

    fileValidation(e: Event) {
        const target = e.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        if (file !== undefined) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const img = new Image();
                img.src = reader.result as string;
                img.onload = () => {
                    if (img.naturalWidth != 640 && img.naturalHeight != 480 && file.size != 921654) {
                        alert('wrong size');
                    } else {
                        if (target.id === 'upload-original') {
                            this.urlOriginal = reader.result as string;
                        } else if (target.id === 'upload-different') {
                            this.urlDifferent = reader.result as string;
                        }
                    }
                };
            };
        }
    }

    ngOnInit(): void {}
}
