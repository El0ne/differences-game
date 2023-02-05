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

    card: GameCardInformation;

    urlOriginal: string;
    urlDifferent: string;

    nbDiff: number = 0;

    gameTitle: string;
    baseImageURL: string;
    difficulty: string; // je
    soloTimes: RankingBoard[];
    multiTimes: RankingBoard[];

    // elouan
    selectedFile: File;

    constructor(private modalDiffService: ModalDiffPageService, public gameCardService: GameCardInformationService) {}

    ngOnInit() {
        this.display$ = this.modalDiffService.watch();
    }

    closeModalPage() {
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
            input.value = '';
            if (ogContext) ogContext.clearRect(0, 0, 640, 480);
        } else {
            const input = document.getElementById('upload-different') as HTMLInputElement;
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
        // elouan

        const input = e.target as HTMLInputElement;

        if (!input.files?.length) {
            return;
        }
        this.selectedFile = input.files[0];
    }

    save(): void {
        // TODO ajouter verif que les images sont upload et qu'on a un nom pour le jeu
        const gameInfo = {
            // TODO add good title, second image and radius
            name: 'this.gameTitle',
            baseImage: 'baseImagePath',
            differenceImage: 'diff',
            radius: 3,
        };
        this.gameCardService.createGame(this.selectedFile, gameInfo).subscribe((data) => console.log('data', data));
    }
}
