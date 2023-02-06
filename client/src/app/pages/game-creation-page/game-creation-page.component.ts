import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GAMES } from '@app/mock/game-cards';
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

    urlOriginal: string;
    urlDifferent: string;

    nbDiff: number = 0;

    gameTitle: string;
    baseImageURL: string;
    difficulty: string; // je
    soloTimes: RankingBoard[];
    multiTimes: RankingBoard[];

    constructor(private modalDiffService: ModalDiffPageService, private router: Router) {}

    ngOnInit() {
        this.display$ = this.modalDiffService.watch();
    }

    open() {
        this.modalDiffService.open();
    }

    close() {
        this.modalDiffService.close();
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
            if (ogContext) ogContext.clearRect(0, 0, 640, 480);
        } else {
            const input = document.getElementById('upload-different') as HTMLInputElement;
            const bothinput = document.getElementById('upload-both') as HTMLInputElement;
            bothinput.value = '';
            input.value = '';
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
                                this.urlOriginal = img.src;
                                break;
                            }
                            case 'upload-different': {
                                if (diffContext) {
                                    diffContext.drawImage(img, 0, 0, 640, 480);
                                }

                                break;
                            }
                            case 'upload-both': {
                                if (ogContext) {
                                    ogContext.drawImage(img, 0, 0, 640, 480);
                                }
                                if (diffContext) {
                                    diffContext.drawImage(img, 0, 0, 640, 480);
                                }
                                break;
                            }
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

    save(): void {
        if (this.gameTitle === undefined && this.baseImageURL === undefined) {
            alert('Il manque une image et un titre à votre jeu !');
        } else if (this.gameTitle === undefined) {
            alert("N'oubliez pas d'ajouter un titre à votre jeu !");
        } else if (this.urlOriginal === undefined) {
            alert('Un jeu de différences sans image est pour ainsi dire... intéressant ? Ajoutez une image.');
        } else {
            this.card.name = this.gameTitle;
            this.card.image = this.baseImageURL;
            this.difficulty = 'Facile'; // initialisation, le temps qu'on sache quelles sont les exigences pr les difficultés.
            this.card.difficulty = this.difficulty;
            this.card.soloTimes = [
                // initialisation. Ces propriétés vont changer une fois qu'un joueur aura joué.
                { time: 0, name: '--' },
                { time: 0, name: '--' },
                { time: 0, name: '--' },
            ];
            this.card.multiTimes = [
                { time: 0, name: '--' },
                { time: 0, name: '--' },
                { time: 0, name: '--' },
            ];
            GAMES.push(this.card);
            this.router.navigate(['/config']);
        }
    }
}
