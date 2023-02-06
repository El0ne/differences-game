import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GameCardInformationService } from '@app/services/game-card-information-service/game-card-information.service';
import { GameCardInformation } from '@common/game-card';
import { RankingBoard } from '@common/ranking-board';
import { Observable } from 'rxjs';
import { ModalDiffPageService } from './modal-diff-page.service';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit {
    @ViewChild('canvas1') myOgCanvas: ElementRef;
    @ViewChild('canvas2') myDiffCanvas: ElementRef;

    display$: Observable<'open' | 'close'>;

    card = new GameCardInformation();

    urlOriginal: File | null = null;
    urlDifferent: File | null = null;

    nbDiff: number = 0;

    gameTitle: string;
    difficulty: string; // je
    soloTimes: RankingBoard[];
    multiTimes: RankingBoard[];

    // elouan
    selectedFile: File;

    constructor(public modalDiffService: ModalDiffPageService, public gameCardService: GameCardInformationService) {}

    ngOnInit() {
        this.display$ = this.modalDiffService.watch();
    }

    getTitle(title: string) {
        this.gameTitle = title;
    }

    clear(e: Event) {
        const ogCanvas: HTMLCanvasElement = this.myOgCanvas.nativeElement;
        const diffCanvas: HTMLCanvasElement = this.myDiffCanvas.nativeElement;

        const ogContext = ogCanvas.getContext('2d');
        const diffContext = diffCanvas.getContext('2d');

        const target = e.target as HTMLInputElement;
        if (target.id === 'reset-original') {
            const input = document.getElementById('upload-original') as HTMLInputElement;
            const bothinput = document.getElementById('upload-both') as HTMLInputElement;
            input.value = '';
            bothinput.value = '';
            this.urlOriginal = null;
            if (ogContext) ogContext.clearRect(0, 0, 640, 480);
        } else {
            const input = document.getElementById('upload-different') as HTMLInputElement;
            const bothinput = document.getElementById('upload-both') as HTMLInputElement;
            bothinput.value = '';
            input.value = '';
            this.urlDifferent = null;
            if (diffContext) diffContext.clearRect(0, 0, 640, 480);
        }
    }

    fileValidation(e: Event) {
        const ogCanvas: HTMLCanvasElement = this.myOgCanvas.nativeElement;
        const diffCanvas: HTMLCanvasElement = this.myDiffCanvas.nativeElement;

        const ogContext = ogCanvas.getContext('2d');
        const diffContext = diffCanvas.getContext('2d');

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
                                if (ogContext) {
                                    ogContext.drawImage(img, 0, 0, 640, 480);
                                }
                                if (!target.files?.length) {
                                    return;
                                }
                                console.log('setup original');
                                this.urlOriginal = target.files[0];
                                break;
                            }
                            case 'upload-different': {
                                if (diffContext) {
                                    diffContext.drawImage(img, 0, 0, 640, 480);
                                }
                                if (!target.files?.length) {
                                    return;
                                }
                                console.log('setup different');
                                this.urlDifferent = target.files[0];
                                break;
                            }
                            case 'upload-both': {
                                if (ogContext) {
                                    ogContext.drawImage(img, 0, 0, 640, 480);
                                }
                                if (diffContext) {
                                    diffContext.drawImage(img, 0, 0, 640, 480);
                                }
                                if (!target.files?.length) {
                                    return;
                                }
                                this.urlOriginal = target.files[0];
                                this.urlDifferent = target.files[0];
                                break;
                            }
                        }
                    }
                };
            };
        } else {
            alert('wrong size or file type please choose again');
            target.value = '';
        }
    }

    saveVerification(): boolean {
        console.log(this.urlOriginal);
        console.log(this.urlDifferent);
        if (this.gameTitle === null && this.urlOriginal === null) {
            alert('Il manque une image et un titre à votre jeu !');
            return false;
        } else if (this.gameTitle === null) {
            alert("N'oubliez pas d'ajouter un titre à votre jeu !");
            return false;
        } else if (this.urlOriginal === null || this.urlDifferent === null) {
            alert('Un jeu de différences sans image est pour ainsi dire... intéressant ? Ajoutez une image.');
            return false;
        }
        return true;
    }
    save(): void {
        if (this.saveVerification()) {
            console.log('you can save :)');
            this.modalDiffService.open();
        }
    }
}
