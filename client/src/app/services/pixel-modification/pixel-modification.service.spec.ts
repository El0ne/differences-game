/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';

import { PixelModificationService } from './pixel-modification.service';

describe('PixelModificationService', () => {
    let service: PixelModificationService;
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.width = 3;
    canvas.height = 1;
    const canvasContext = canvas.getContext('2d') as CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PixelModificationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('positionToPixel() should return correct pixel coordinates when given linear position', () => {
        const postToCheck = 307199;
        const position = service.positionToPixel(postToCheck);
        expect(position).toEqual([639, 479]);
    });

    it('turnDifferenceYellow should turn pixel differences yellow', () => {
        const fillRectSpy = spyOn(canvasContext, 'fillRect');
        canvasContext.fillStyle = '#222222';
        service.turnDifferenceYellow(canvasContext, [0]);

        expect(fillRectSpy).toHaveBeenCalledWith(0, 0, 1, 1);
        expect(canvasContext.fillStyle).toEqual('#ffd700');
    });

    it('turnOffYellow should turn pixel differences not yellow', () => {
        const clearRectSpy = spyOn(canvasContext, 'clearRect');

        canvasContext.fillStyle = '#00ffff';
        service.turnOffYellow(canvasContext, [0]);

        expect(clearRectSpy).toHaveBeenCalledWith(0, 0, 1, 1);
        expect(canvasContext.fillStyle).toEqual('#00ffff');
    });

    it('getColorFromDifference should return the color data of the pixels at the specified positions', () => {
        const imageData = canvasContext.createImageData(1, 1);
        imageData.data[0] = 255;
        imageData.data[1] = 0;
        imageData.data[2] = 0;
        imageData.data[3] = 255;
        canvasContext.putImageData(imageData, 0, 0);

        const result = service.getColorFromDifference(canvasContext, [0]);

        expect(result.length).toBe(1);
        expect(result[0].data[0]).toBe(255);
        expect(result[0].data[1]).toBe(0);
        expect(result[0].data[2]).toBe(0);
        expect(result[0].data[3]).toBe(255);
    });

    it('should paint color from difference', () => {
        const colorArray = [
            new ImageData(new Uint8ClampedArray([255, 255, 0, 255]), 1, 1),
            new ImageData(new Uint8ClampedArray([0, 255, 255, 255]), 1, 1),
        ];
        const positionArray = [0, 2];

        const fillRectSpy = spyOn(canvasContext, 'fillRect');

        service.paintColorFromDifference(colorArray, positionArray, canvasContext);

        expect(fillRectSpy.calls.count()).toEqual(2);
        expect(fillRectSpy.calls.argsFor(0)).toEqual([0, 0, 1, 1]);
        expect(fillRectSpy.calls.argsFor(1)).toEqual([2, 0, 1, 1]);

        expect(canvasContext.fillStyle).toEqual('#00ffff');
    });
});
