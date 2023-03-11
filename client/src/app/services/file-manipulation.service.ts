import { Injectable } from '@angular/core';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';

interface FileInformation {
    originalFile: File | null;
    differenceFile: File | null;
    originalCanvas: HTMLCanvasElement;
    differenceCanvas: HTMLCanvasElement;
}

@Injectable({
    providedIn: 'root',
})
export class FileManipulationService {
    originalFile: File | null;
    differentFile: File | null;
    originalCanvas: HTMLCanvasElement;
    differenceCanvas: HTMLCanvasElement;

    updateAttributes(fileInformation: FileInformation): void {
        this.originalFile = fileInformation.originalFile;
        this.differentFile = fileInformation.differenceFile;
        this.originalCanvas = fileInformation.originalCanvas;
        this.differenceCanvas = fileInformation.differenceCanvas;
    }

    updateFiles(): (File | null)[] {
        return [this.originalFile, this.differentFile];
    }

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

    async fileValidation(event: Event): Promise<void> {
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        if (file !== undefined && file.size === IMAGE_DIMENSIONS.size && file.type === 'image/bmp') {
            await this.uploadImages(file, target);
        } else {
            alert('wrong size or file type please choose again');
            target.value = '';
        }
    }

    async uploadImages(file: File, target: HTMLInputElement): Promise<void> {
        if (target.id === 'upload-original') {
            this.originalFile = await this.uploadImage(file, target, this.originalCanvas);
        } else if (target.id === 'upload-different') {
            this.differentFile = await this.uploadImage(file, target, this.differenceCanvas);
        } else {
            this.originalFile = await this.uploadImage(file, target, this.originalCanvas);
            this.differentFile = await this.uploadImage(file, target, this.differenceCanvas);
        }
    }
}
