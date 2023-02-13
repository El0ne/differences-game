export class ImageDimensions {
    readonly width: number;
    readonly height: number;
    readonly size: number;
    constructor(width: number, heigh: number, size: number) {
        this.width = width;
        this.height = heigh;
        this.size = size;
    }
}

export const IMAGE_DIMENSIONS: ImageDimensions = new ImageDimensions(640, 480, 921654); // 921654 = 640px * 480px * 3 bytes (24 bits)
