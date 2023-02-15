import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-modal-page',
    templateUrl: './modal-page.component.html',
    styleUrls: ['./modal-page.component.scss'],
})
export class ModalPageComponent implements OnDestroy {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            image: string;
            difference: number;
            difficulty: string;
        },
        public matDialogRef: MatDialogRef<ModalPageComponent>,
        public router: Router,
    ) {}

    ngOnDestroy() {
        this.matDialogRef.close(this.data);
    }
    close() {
        this.matDialogRef.close(this.data);
        this.matDialogRef.afterClosed().subscribe((result) => {
            result.image = '';
            this.router.navigate(['/config']);
        });
    }
}
