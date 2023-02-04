export class ImageDimentions {
    readonly width: number;
    readonly height: number;
    constructor(width: number, heigh: number) {
        this.width = width;
        this.height = heigh;
    }
}

export const IMAGE_DIMENTIONS: ImageDimentions = new ImageDimentions(640, 480);
