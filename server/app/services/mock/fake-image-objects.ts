/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Images } from '@app/schemas/images.schema';
import { ObjectId } from 'mongodb';

export const getFakeImageObject = (): Images => ({
    _id: new ObjectId(),
    originalImageName: 'oriegbw;fb',
    differenceImageName: 'reibgqvefve',
});
