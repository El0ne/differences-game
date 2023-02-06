export class ImageDimensions {
    readonly width: number;
    readonly height: number;
    constructor(width: number, heigh: number) {
        this.width = width;
        this.height = heigh;
    }
}

export const IMAGE_DIMENSIONS: ImageDimensions = new ImageDimensions(640, 480);
