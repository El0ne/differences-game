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
            originalFile: null,
            differenceFile: null,
            originalCanvas: new HTMLCanvasElement(),
            differenceCanvas: new HTMLCanvasElement(),
        };

        service.updateAttributes(fileInformation);
        expect(service.originalFile).toEqual(fileInformation.originalFile);
        expect(service.differenceFile).toEqual(fileInformation.differenceFile);
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
});
