import { GameCardInformation } from '@common/game-card';
import { Injectable } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';

@Injectable()
export class DataBaseService {
    db: Db;
    private client: MongoClient;
    async start(url: string = process.env.DB_URL): Promise<void> {
        try {
            this.client = new MongoClient(url);
            await this.client.connect();
            this.db = this.client.db(process.env.DB_NAME);
        } catch {
            throw new Error('Database connection error');
        }

        if ((await this.db.collection(process.env.DB_GAMECARDS_COLLECTION).countDocuments()) === 0) {
            await this.populateDB();
        }
    }

    async populateDB(): Promise<void> {
        const gameCards: GameCardInformation[] = [
            {
                id: 'cb46f7b1-2f73-4412-a83f-769bd24b7cf1',
                name: '72',
                difficulty: 'Facile',
                differenceNumber: 6,
                originalImageName: '73591eea-d3e9-4762-9fe3-aea07c0c2fae.bmp',
                differenceImageName: 'dfaaef6e-0244-4180-aa0d-a9b1cd146516.bmp',
                soloTimes: [
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                ],
                multiTimes: [
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                ],
            },
            {
                id: '8851f9cd-1f28-40dc-81a7-a982fb9b267c',
                name: '23',
                difficulty: 'Facile',
                differenceNumber: 5,
                originalImageName: '68cbb538-6db0-4dd6-a9a2-368db6130d1c.bmp',
                differenceImageName: 'f205a1c5-02d8-49c9-841e-c98799069686.bmp',
                soloTimes: [
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                ],
                multiTimes: [
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                ],
            },
            {
                id: '6057e6e5-8394-4df7-8a7c-6c06ba0cdfb0',
                name: '07',
                difficulty: 'Difficile',
                differenceNumber: 7,
                originalImageName: '7e572746-9667-4cc0-acce-d7ae7fc185cf.bmp',
                differenceImageName: '0a73b00d-5a16-47cb-b25f-db7a7aba6ccb.bmp',
                soloTimes: [
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                ],
                multiTimes: [
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                ],
            },
            {
                id: '5ae8eb57-6abe-4325-b5a5-15d659a62d96',
                name: '03',
                difficulty: 'Facile',
                differenceNumber: 3,
                originalImageName: '38a97547-0dc4-4d0e-afc7-eafbc5ba99d1.bmp',
                differenceImageName: '0d10fa09-44b4-4024-86f7-61c638bc9323.bmp',
                soloTimes: [
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                ],
                multiTimes: [
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                    { time: 0, name: '--' },
                ],
            },
        ];

        for (const gameCard of gameCards) {
            await this.db.collection(process.env.DB_GAMECARDS_COLLECTION).insertOne(gameCard);
        }
    }
}
