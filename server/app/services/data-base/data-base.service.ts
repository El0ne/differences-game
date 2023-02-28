import { Injectable } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';

@Injectable()
export class DataBaseService {
    db: Db;
    private client: MongoClient;
    // async start(url: string = process.env.DB_URL): Promise<void> {
    //     try {
    //         this.client = new MongoClient(url);
    //         await this.client.connect();
    //         this.db = this.client.db(process.env.DB_NAME);
    //     } catch {
    //         throw new Error('Database connection error');
    //     }

    //     if ((await this.db.collection(process.env.DB_GAMECARDS_COLLECTION).countDocuments()) === 0) {
    //         await this.populateDB();
    //     }
    // }

    // async populateDB(): Promise<void> {
    //     const gameCards: GameCardInformation[] = [
    //         {
    //             id: 'cb46f7b1-2f73-4412-a83f-769bd24b7cf1',
    //             name: '72',
    //             difficulty: 'Facile',
    //             differenceNumber: 6,
    //             originalImageName: '73591eea-d3e9-4762-9fe3-aea07c0c2fae.bmp',
    //             differenceImageName: 'dfaaef6e-0244-4180-aa0d-a9b1cd146516.bmp',
    //             soloTimes: [
    //                 { time: 0, name: '--' },
    //                 { time: 0, name: '--' },
    //                 { time: 0, name: '--' },
    //             ],
    //             multiTimes: [
    //                 { time: 0, name: '--' },
    //                 { time: 0, name: '--' },
    //                 { time: 0, name: '--' },
    //             ],
    //         },
    //     ];

    //     for (const gameCard of gameCards) {
    //         await this.db.collection(process.env.DB_GAMECARDS_COLLECTION).insertOne(gameCard);
    //     }
    // }
}
