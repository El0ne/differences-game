import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';

import { FileInformation, FileManipulationService } from './file-manipulation.service';

describe('FileManipulationService', () => {
    let service: FileManipulationService;
    let canvas: HTMLCanvasElement;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FileManipulationService);
        canvas = document.createElement('canvas');
        canvas.width = IMAGE_DIMENSIONS.width;
        canvas.height = IMAGE_DIMENSIONS.height;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('updateAttributes should set the service attributes', () => {
        const fileInformation: FileInformation = {
            originalFile: new File([], 'new-original.bmp'),
            differenceFile: new File([], 'new-difference.bmp'),
            originalCanvas: document.createElement('canvas'),
            differenceCanvas: document.createElement('canvas'),
        };

        service.originalFile = new File([], 'original.jpg');
        service.differenceFile = new File([], 'difference.jpg');
        service.originalCanvas = document.createElement('canvas');
        service.differenceCanvas = document.createElement('canvas');

        service.updateAttributes(fileInformation);
        expect(service.originalFile).toBe(fileInformation.originalFile as File);
        expect(service.differenceFile).toEqual(fileInformation.differenceFile as File);
        expect(service.originalCanvas).toEqual(fileInformation.originalCanvas);
        expect(service.differenceCanvas).toEqual(fileInformation.differenceCanvas);
    });

    it('updateFile should return an array with the value of the two files', () => {
        service.originalFile = null;
        service.differenceFile = null;

        const updatedFiles = service.updateFiles();
        expect(updatedFiles).toEqual([service.originalFile, service.differenceFile]);
    });

    it('should clear the single file', () => {
        const id = 'upload-original';
        const input = document.createElement('input');
        input.id = id;
        document.body.appendChild(input);
        const bothInput = document.createElement('input');
        bothInput.id = 'upload-both';
        document.body.appendChild(bothInput);

        service.clearFile(canvas, id, new File([], 'test.bmp', { type: 'image/bmp' }));

        const context = canvas.getContext('2d');
        let validate = false;
        if (context) validate = !context.getImageData(0, 0, canvas.width, canvas.height).data.some((channel: number) => channel !== 0);
        expect(validate).toBe(true);
        expect(input.value).toEqual('');
        expect(bothInput.value).toEqual('');
    });

    it('should validate the file', async () => {
        const uploadImageMock = spyOn(service, 'uploadImages' as never);
        const file = new File([new ArrayBuffer(IMAGE_DIMENSIONS.size)], 'testImage.bmp', { type: 'image/bmp' });
        const inputElementRef: ElementRef = {
            nativeElement: document.createElement('input'),
        };
        const input: HTMLInputElement = inputElementRef.nativeElement;
        input.type = 'file';
        document.body.appendChild(input);
        const event = new Event('change');
        Object.defineProperty(event, 'target', { value: { files: [file] } });
        input.dispatchEvent(event);
        service.fileValidation(event);
        expect(uploadImageMock).toHaveBeenCalled();
    });

    //     it('should send an alert if picture is the wrong size', () => {
    //         spyOn(window, 'alert');

    //         // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    //         const file = new File([new ArrayBuffer(123456)], 'testImage.bmp', { type: 'image/bmp' });

    //         const input = fixture.debugElement.query(By.css('input[type="file"]')).nativeElement as HTMLInputElement;
    //         const event = new Event('change');
    //         Object.defineProperty(event, 'target', { value: { files: [file] } });
    //         input.dispatchEvent(event);

    //         component.fileValidation(event);

    //         expect(window.alert).toHaveBeenCalledWith('wrong size or file type please choose again');
    //         expect(input.value).toBe('');
    //     });

    //     it('should send an alert if picture is the wrong type', () => {
    //         spyOn(window, 'alert');

    //         const file = new File([new ArrayBuffer(IMAGE_DIMENSIONS.size)], 'testImage.jpg', { type: 'image/jpg' });

    //         const input = fixture.debugElement.query(By.css('input[type="file"]')).nativeElement as HTMLInputElement;
    //         const event = new Event('change');
    //         Object.defineProperty(event, 'target', { value: { files: [file] } });
    //         input.dispatchEvent(event);

    //         component.fileValidation(event);

    //         expect(window.alert).toHaveBeenCalledWith('wrong size or file type please choose again');
    //         expect(input.value).toBe('');
    //     });
});
