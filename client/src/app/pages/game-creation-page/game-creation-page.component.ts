import { Component } from '@angular/core';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    urlOriginal: string;
    urlDifferent: string;

    constructor() {}

    clear(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.id === 'reset-original') {
            this.urlOriginal = '';
            const input = document.getElementById('upload-original') as HTMLInputElement;
            input.value = '';
        } else {
            this.urlDifferent = '';
            const input = document.getElementById('upload-different') as HTMLInputElement;
            input.value = '';
        }
    }

    fileValidation(e: Event) {
        const target = e.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        if (file !== undefined && file.size === 921654 && file.type === 'image/bmp') {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const img = new Image();
                img.src = reader.result as string;
                img.onload = () => {
                    if (img.naturalWidth !== 640 && img.naturalHeight !== 480) {
                        alert('wrong size');
                    } else {
                        switch (target.id) {
                            case 'upload-original': {
                                this.urlOriginal = reader.result as string;

                                break;
                            }
                            case 'upload-different': {
                                this.urlDifferent = reader.result as string;

                                break;
                            }
                            case 'upload-both': {
                                this.urlOriginal = reader.result as string;
                                this.urlDifferent = reader.result as string;

                                break;
                            }
                            // No default
                        }
                    }
                };
            };
        } else {
            alert('wrong size or file type please choose again');
            this.urlOriginal = '';
            this.urlDifferent = '';
            target.value = '';
        }
    }
    ngOnInit(): void {}
}
