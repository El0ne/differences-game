import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-modal-page',
    templateUrl: './modal-page.component.html',
    styleUrls: ['./modal-page.component.scss'],
})
export class ModalPageComponent implements OnInit, OnDestroy {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            image: string;
            difference: number;
            difficulty: string;
        },
        private matDialogRef: MatDialogRef<ModalPageComponent>,
    ) {}

    ngOnInit(): void {}

    ngOnDestroy() {
        this.matDialogRef.close(this.data);
    }
}
