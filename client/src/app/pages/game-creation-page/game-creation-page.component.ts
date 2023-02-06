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

    urlOriginal: File;
    urlDifferent: File;

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
            // this.urlOriginal = '';
            // this.urlDifferent = '';
            target.value = '';
        }
        // elouan
    }

    // testElouan(test) {
    //     const input = e.target as HTMLInputElement;

    //     // Passer une valeur dans fileValidation qu<on va utiliser
    //     // dans un switch case ou autre pour assigner selecteFiles
    //     // (on va creer d<autres attributs. 3 au total un pour upload
    //     // 1 un pour upload 2 et un pour les deux uplod (on peut juste assigner les deux individuels))
    //     if (!input.files?.length) {
    //         return;
    //     }
    //     test = input.files[0];
    //     console.log('input image', test);
    // }

    // validateInputs(): boolean {
    //     return this.gameTitle !== '' && this.urlOriginal !== '' && this.urlDifferent !== '';
    // }
    save(): void {
        // if (this.validateInputs()) {
        console.log('this.urlOriginal', this.urlOriginal);
        console.log('this.urlDifferent', this.urlDifferent);
        // TODO ajouter verif que les images sont upload et qu'on a un nom pour le jeu
        // this.gameCardService.uploadImages(this.selectedFile).subscribe((data) => {
        //     const gameInfo = {
        //         // TODO add good title, second image and radius
        //         name: this.gameTitle,
        //         baseImage: data[0].filename,
        //         differenceImage: data[1].filename,
        //         radius: 3,
        //     };
        //     //
        //     this.gameCardService.createGame(gameInfo).subscribe((e) => console.log(e));
        //     // this.router.navigate(['/config']);
        // });
    }
}
