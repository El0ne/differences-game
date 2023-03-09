import { Injectable } from '@nestjs/common';

interface Test {
    numberOfGames: number;
    deleted: boolean;
}
@Injectable()
export class GameManagerService {
    gamePlayedInformation: Map<string, Test>;
    // map <id, {nbParties: number , deleted: boolean}>

    constructor() {}

    endGame(id: string) {
        console.log('Game ended:', id);
        const currentTest = this.gamePlayedInformation.get(id);
        if (currentTest.numberOfGames === 1) {
            this.gamePlayedInformation.delete(id);
            // service to delete difference
        } else {
            currentTest.numberOfGames -= 1;
            this.gamePlayedInformation.set(id, currentTest);
        }
        console.log('end game');
        console.log('this.gamePlayedInformation', this.gamePlayedInformation);
    }

    addGame(id: string) {
        const currentTest = this.gamePlayedInformation.get(id);
        if (currentTest) {
            currentTest.numberOfGames += 1;
            this.gamePlayedInformation.set(id, currentTest);
        } else {
            this.gamePlayedInformation.set(id, {
                numberOfGames: 1,
                deleted: false,
            });
        }
    }

    deleteGame(id: string) {
        const currentTest = this.gamePlayedInformation.get(id);
        currentTest.deleted = true;
        this.gamePlayedInformation.set(id, currentTest);
    }
}
