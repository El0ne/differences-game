import { ElementRef } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { IMAGE_DIMENSIONS } from '@common/image-dimensions';

import { FileInformation, FileManipulationService } from './file-manipulation.service';

describe('FileManipulationService', () => {
    let service: FileManipulationService;
    let canvas: HTMLCanvasElement;
    let input: HTMLInputElement;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FileManipulationService);
        canvas = document.createElement('canvas');
        canvas.width = IMAGE_DIMENSIONS.width;
        canvas.height = IMAGE_DIMENSIONS.height;

        const inputElementRef: ElementRef = {
            nativeElement: document.createElement('input'),
        };
        input = inputElementRef.nativeElement;
        input.type = 'file';
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

    it('clearFile should clear the single file', () => {
        const id = 'upload-original';
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

    it('fileValidation should validate the file', async () => {
        const uploadImageMock = spyOn(service, 'uploadImages' as never);
        const file = new File([new ArrayBuffer(IMAGE_DIMENSIONS.size)], 'testImage.bmp', { type: 'image/bmp' });
        document.body.appendChild(input);
        const event = new Event('change');
        Object.defineProperty(event, 'target', { value: { files: [file] } });
        input.dispatchEvent(event);
        service.fileValidation(event);
        expect(uploadImageMock).toHaveBeenCalled();
    });

    it('fileValidation should send an alert if picture is the wrong size', () => {
        spyOn(window, 'alert');

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const file = new File([new ArrayBuffer(123456)], 'testImage.bmp', { type: 'image/bmp' });

        const event = new Event('change');

        Object.defineProperty(event, 'target', { value: { files: [file] } });
        input.dispatchEvent(event);

        service.fileValidation(event);

        expect(window.alert).toHaveBeenCalledWith('wrong size or file type please choose again');
        expect(input.value).toBe('');
    });

    it('fileValidation should send an alert if picture is the wrong type', () => {
        spyOn(window, 'alert');

        const file = new File([new ArrayBuffer(IMAGE_DIMENSIONS.size)], 'testImage.jpg', { type: 'image/jpg' });

        const event = new Event('change');
        Object.defineProperty(event, 'target', { value: { files: [file] } });
        input.dispatchEvent(event);

        service.fileValidation(event);

        expect(window.alert).toHaveBeenCalledWith('wrong size or file type please choose again');
        expect(input.value).toBe('');
    });

    it('uploadImages should upload to original canvas if target-id is upload-original', fakeAsync(async () => {
        const file = new File([new ArrayBuffer(IMAGE_DIMENSIONS.size)], 'testImage.bmp', { type: 'image/jpg' });
        input.id = 'upload-original';

        spyOn(service, 'uploadImage' as never).and.returnValue(Promise.resolve(file) as never);
        await service['uploadImages'](file, input);

        expect(service['uploadImage']).toHaveBeenCalledWith(file, input, service.originalCanvas);
        expect(service.originalFile).toEqual(file);
    }));

    it('uploadImage should upload the image and return a file', fakeAsync(async () => {
        const file = new File([new ArrayBuffer(IMAGE_DIMENSIONS.size)], 'testImage.bmp', { type: 'image/bmp' });

        const readerSpy = jasmine.createSpyObj('FileReader', ['readAsDataURL']);

        spyOn(window, 'FileReader' as never).and.returnValue(readerSpy as never);

        service['uploadImage'](file, input, canvas).then((updatedFile) => {
            expect(updatedFile).toBe(file);
        });

        readerSpy.onload();
        tick();
    }));

    it('drawCanvas should return null if target has no files', () => {
        const image = document.createElement('img');
        const result = service['drawToCanvas'](canvas, input, image);
        expect(result).toBeNull();
    });

    it('drawCanvas should draw image to canvas', () => {
        const file = new File([new ArrayBuffer(IMAGE_DIMENSIONS.size)], 'testImage.bmp', { type: 'image/bmp' });
        const image = document.createElement('img');

        spyOnProperty(input, 'files', 'get').and.returnValue([file]);
        const returnValue = service['drawToCanvas'](canvas, input, image);
        expect(returnValue).toEqual(file);
    });
});
