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
        this.gamePlayedInformation.set(id, {
            numberOfGames: 0,
            deleted: false,
        });
        console.log('this.gamePlayedInformation', this.gamePlayedInformation);
    }

    async endGame(id: string): Promise<void> {
        const currentTest = this.gamePlayedInformation.get(id);
        if (currentTest) {
            if (currentTest.numberOfGames === 1 && currentTest.deleted) {
                this.gamePlayedInformation.delete(id);
                await this.differenceClickService.deleteDifferences(id);
            } else {
                currentTest.numberOfGames -= 1;
                this.gamePlayedInformation.set(id, currentTest);
            }
        }
        console.log('this.gamePlayedInformation', this.gamePlayedInformation);
    }

    addGame(id: string): void {
        const currentTest = this.gamePlayedInformation.get(id);
        if (currentTest) {
            currentTest.numberOfGames += 1;
            this.gamePlayedInformation.set(id, currentTest);
        }
        console.log('map ', this.gamePlayedInformation);
    }

    async deleteGame(id: string): Promise<void> {
        console.log('delete game');
        const currentTest = this.gamePlayedInformation.get(id);
        if (currentTest.numberOfGames === 0) {
            this.gamePlayedInformation.delete(id);
            await this.differenceClickService.deleteDifferences(id);
        } else {
            currentTest.deleted = true;
            this.gamePlayedInformation.set(id, currentTest);
        }
        console.log('map ', this.gamePlayedInformation);
    }
}
