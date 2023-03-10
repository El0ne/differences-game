import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { Injectable } from '@nestjs/common';

interface Test {
    numberOfGames: number;
    deleted: boolean;
}
@Injectable()
export class GameManagerService {
    gamePlayedInformation: Map<string, Test> = new Map();
    // map <id, {nbParties: number , deleted: boolean}>

    constructor(private differenceClickService: DifferenceClickService) {}

    createGame(id: string): void {
        console.log('create game');
        this.gamePlayedInformation.set(id, {
            numberOfGames: 0,
            deleted: false,
        });
        console.log('this.gamePlayedInformation', this.gamePlayedInformation);
    }

    async endGame(id: string): Promise<void> {
        // console.log('Game ended:', id);
        const currentTest = this.gamePlayedInformation.get(id);
        if (currentTest) {
            if (currentTest.numberOfGames === 1 && currentTest.deleted) {
                this.gamePlayedInformation.delete(id);
                console.log('service to delete differences');
                await this.differenceClickService.deleteDifferences(id);

                // service to delete difference
            } else {
                currentTest.numberOfGames -= 1;
                this.gamePlayedInformation.set(id, currentTest);
            }
        }
        console.log('this.gamePlayedInformation', this.gamePlayedInformation);
    }

    addGame(id: string): void {
        // console.log('Game started:', id);

        const currentTest = this.gamePlayedInformation.get(id);
        // console.log('currentTest', currentTest);
        if (currentTest) {
            currentTest.numberOfGames += 1;
            // console.log('currentTest.numberOfGames', currentTest.numberOfGames);
            this.gamePlayedInformation.set(id, currentTest);
        }
        console.log('map ', this.gamePlayedInformation);
    }

    async deleteGame(id: string): Promise<void> {
        console.log('delete game');
        const currentTest = this.gamePlayedInformation.get(id);
        currentTest.deleted = true;
        this.gamePlayedInformation.set(id, currentTest);
        if (currentTest.numberOfGames === 0) {
            console.log('service to delete differences');
            await this.differenceClickService.deleteDifferences(id);
        }
    }
}
