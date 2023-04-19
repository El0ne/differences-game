import { Images } from '@app/schemas/images.schema';
import { ObjectId } from 'mongodb';

export const getFakeImages = (): Images => ({
    _id: new ObjectId(),
    originalImageName: 'oriegbw;fb',
    differenceImageName: 'reibgqvefve',
});
