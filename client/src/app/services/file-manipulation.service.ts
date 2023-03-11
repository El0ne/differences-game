import { Injectable } from '@angular/core';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';

@Injectable({
    providedIn: 'root',
})
export class FileManipulationService {
    clearFile(canvas: HTMLCanvasElement, id: string, file: File | null): void {
        // we just want to set the file to null
        // eslint-disable-next-line no-unused-vars
        file = null;
        const context = canvas.getContext('2d');
        const input = document.getElementById(id) as HTMLInputElement;
        const bothInput = document.getElementById('upload-both') as HTMLInputElement;
        input.value = '';
        bothInput.value = '';
        if (context) context.clearRect(0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
    }

    async uploadImage(file: File, target: HTMLInputElement, canvas: HTMLCanvasElement): Promise<File | null> {
        // console.log('target', target);
        // let updatedFile: File | null = null;
        // const reader = new FileReader();
        // reader.readAsDataURL(file);
        // reader.onload = () => {
        //     const img = new Image();
        //     img.src = reader.result as string;
        //     img.onload = () => {
        //         updatedFile = this.drawToCanvas(canvas, target, img);
        //         console.log('rwger', updatedFile);
        //     };
        // };
        // console.log('updatedFile', updatedFile);
        // return updatedFile;
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const img = new Image();
                img.src = reader.result as string;
                img.onload = () => {
                    const updatedFile = this.drawToCanvas(canvas, target, img);
                    resolve(updatedFile);
                };
            };
        });
    }

    drawToCanvas(canvas: HTMLCanvasElement, target: HTMLInputElement, img: HTMLImageElement): File | null {
        const context = canvas.getContext('2d');
        if (!target.files?.length) {
            return null;
        }
        if (context) context.drawImage(img, 0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
        return target.files[0];
    }

    // async fileValidation(event: Event): Promise<void> {
    //     const target = event.target as HTMLInputElement;
    //     const file: File = (target.files as FileList)[0];
    //     if (file !== undefined && file.size === IMAGE_DIMENSIONS.size && file.type === 'image/bmp') {
    //         await this.uploadImage(file, target);
    //     } else {
    //         alert('wrong size or file type please choose again');
    //         target.value = '';
    //     }
    // }

    // async uploadImage(file: File, target: HTMLInputElement): Promise<void> {
    //     const ogContext = this.myOgCanvas.nativeElement.getContext('2d');
    //     const diffContext = this.myDiffCanvas.nativeElement.getContext('2d');
    //     const reader = new FileReader();
    //     reader.readAsDataURL(file);

    //     reader.onload = () => {
    //         const img = new Image();
    //         img.src = reader.result as string;
    //         img.onload = () => {
    //             if (!target.files?.length) {
    //                 return;
    //             }
    //             if (target.id === this.originalId) {
    //                 if (ogContext) ogContext.drawImage(img, 0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
    //                 this.originalFile = target.files[0];
    //             } else if (target.id === this.differentId) {
    //                 if (diffContext) diffContext.drawImage(img, 0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
    //                 this.differentFile = target.files[0];
    //             } else {
    //                 if (ogContext && diffContext) {
    //                     ogContext.drawImage(img, 0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
    //                     diffContext.drawImage(img, 0, 0, IMAGE_DIMENSIONS.width, IMAGE_DIMENSIONS.height);
    //                     this.originalFile = target.files[0];
    //                     this.differentFile = target.files[0];
    //                 }
    //             }
    //         };
    //     };
    // }
}
