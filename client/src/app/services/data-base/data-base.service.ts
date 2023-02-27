import { Injectable } from '@angular/core';
import { MongoClient } from 'mongodb';
import gameCardsInformations from '../../../../../server/app/dataBase/game-cards-informations.json';

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

@Injectable({
    providedIn: 'root',
})
export class DataBaseService {
    async connectToMongoDB() {
        try {
            await client.connect();
            console.log('Connection to MongoDB was successful');
        } catch (error) {
            console.error(error);
        } finally {
            await client.close();
        }
    }

    async insertOneGameCard() {
        try {
            await client.connect();
            console.log('Connection to MongoDB was successful');

            const db = client.db('projectCollection');
            const gameCardsCollection = db.collection('gameCardsInformations');
            const newGameCard = {
                name: 'testGameCardName',
                difficulty: 'testDifficulty',
                differenceNumber: 3,
                originalImageName: 'originalImageTest.bmp',
                differenceImageName: 'differenceImageTest.bmp',
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
            };
            await gameCardsCollection.insertOne(newGameCard);
            console.log('Game card was inserted successfully');
        } catch (err) {
            console.error(err);
        } finally {
            await client.close();
        }
    }

    async insertAllGameCards() {
        try {
            await client.connect();
            console.log('Connected to MongoDB!');

            const db = client.db('projectCollection');
            const gameCardsCollection = db.collection('gameCardsInformations');
            const gameCards = JSON.parse(gameCardsInformations);
            await gameCardsCollection.insertMany(gameCards);
            console.log('Game cards inserted successfully!');
        } catch (err) {
            console.error(err);
        } finally {
            await client.close();
        }
    }

    async findGameCardByName(gameCardName: string): Promise<unknown> {
        try {
            await client.connect();
            console.log('Connected to MongoDB was successful');

            const db = client.db('projectCollection');
            const gameCardsCollection = db.collection('gameCardsInformations');
            const toBeFound = { name: gameCardName };
            const gameCard = await gameCardsCollection.findOne(toBeFound);
            console.log('Game card was found successfully');
            return gameCard;
        } catch (err) {
            console.error(err);
        } finally {
            await client.close();
        }
    }

    async deleteGameCard(gameCardName: string) {
        try {
            await client.connect();
            console.log('Connected to MongoDB was successful');

            const db = client.db('projectCollection');
            const gameCardsCollection = db.collection('gameCardsInformations');
            const toBeDeleted = { name: gameCardName };
            await gameCardsCollection.deleteOne(toBeDeleted);
            console.log('Game card was deleted successfully');
        } catch (err) {
            console.error(err);
        } finally {
            await client.close();
        }
    }
}
