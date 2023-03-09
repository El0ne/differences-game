import { Injectable } from '@nestjs/common';

interface Test {
    numberOfGames: number;
    deleted: boolean;
}
@Injectable()
export class GameManagerService {
    gamePlayedInformation: Map<string, Test> = new Map();
    // map <id, {nbParties: number , deleted: boolean}>

    // constructor() {}

    endGame(id: string) {
        console.log('Game ended:', id);
        // const currentTest = this.gamePlayedInformation.get(id);
        // if (currentTest.numberOfGames === 1) {
        //     this.gamePlayedInformation.delete(id);
        //     // service to delete difference
        // } else {
        //     currentTest.numberOfGames -= 1;
        //     this.gamePlayedInformation.set(id, currentTest);
        // }
        console.log('this.gamePlayedInformation', this.gamePlayedInformation);
    }

    addGame(id: string) {
        console.log('Game started:', id);

        const currentTest = this.gamePlayedInformation.get(id);
        console.log('currentTest', currentTest);
        if (currentTest) {
            currentTest.numberOfGames += 1;
            console.log('currentTest.numberOfGames', currentTest.numberOfGames);
            this.gamePlayedInformation.set(id, currentTest);
        } else {
            this.gamePlayedInformation.set(id, {
                numberOfGames: 1,
                deleted: false,
            });
        }
        console.log('map ', this.gamePlayedInformation);
    }

    deleteGame(id: string) {
        const currentTest = this.gamePlayedInformation.get(id);
        currentTest.deleted = true;
        this.gamePlayedInformation.set(id, currentTest);
    }
}
