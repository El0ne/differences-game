import { GameCardInformation } from '@common/game-card';
import { GameInformation } from '@common/game-information';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class GameCardService {
    jsonPath = path.join(process.cwd(), '/app/dataBase/game-cards-informations.json');

    getAllGameCards(): GameCardInformation[] {
        const content = fs.readFileSync(this.jsonPath, 'utf8');
        return JSON.parse(content).gameCardsInformations;
    }
    getGameCards(startIndex: number, endIndex: number): GameCardInformation[] {
        return this.getAllGameCards().slice(startIndex, endIndex);
    }
    getGameCardsNumber(): number {
        const content = fs.readFileSync(this.jsonPath, 'utf8');
        return JSON.parse(content).gameCardsInformations.length;
    }

    createGameCard(game): GameCardInformation {
        const allGameCards = this.getAllGameCards();
        const newGame = this.generateGameCard(game);
        allGameCards.push(newGame);
        fs.writeFileSync(this.jsonPath, JSON.stringify({ gameCardsInformations: allGameCards }));
        return newGame;
    }

    generateGameCard(game: GameInformation): GameCardInformation {
        this.saveGameImage(game);
        return {
            name: game.name,
            difficulty: 'Facile',
            image: '/assets/444-640x480.jpg',
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
    }

    saveGameImage(gameInfo: GameInformation) {
        console.log('called');
        // const fileFormat =  this.chooseProperEncoding(playlist.thumbnail);
        const thumbnailData = gameInfo.baseImage.replace('data:image/bmp;base64,', '');
        const imageFileName = `assets/images/${gameInfo.name}.txt`;
        const filePath = path.join(process.cwd() + `/${imageFileName}`);
        // fs..writeFile(filePath, thumbnailData, {
        //     encoding: 'base64',
        // });
        fs.writeFileSync(filePath, gameInfo.baseImage, {
            // encoding: 'base64',
        });

        gameInfo.baseImage = imageFileName;
    }
}
