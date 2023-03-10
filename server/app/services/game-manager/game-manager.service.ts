import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { Injectable } from '@nestjs/common';

interface MapGameInfo {
    numberOfGames: number;
    deleted: boolean;
}
@Injectable()
export class GameManagerService {
    gamePlayedInformation: Map<string, MapGameInfo> = new Map();
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
        const currentMapGameInfo = this.gamePlayedInformation.get(id);
        if (currentMapGameInfo) {
            if (currentMapGameInfo.numberOfGames === 1 && currentMapGameInfo.deleted) {
                this.gamePlayedInformation.delete(id);
                await this.differenceClickService.deleteDifferences(id);
            } else {
                currentMapGameInfo.numberOfGames -= 1;
                this.gamePlayedInformation.set(id, currentMapGameInfo);
            }
        }
        console.log('this.gamePlayedInformation', this.gamePlayedInformation);
    }

    addGame(id: string): void {
        const currentMapGameInfo = this.gamePlayedInformation.get(id);
        if (currentMapGameInfo) {
            currentMapGameInfo.numberOfGames += 1;
            this.gamePlayedInformation.set(id, currentMapGameInfo);
        }
        console.log('map ', this.gamePlayedInformation);
    }

    async deleteGame(id: string): Promise<void> {
        console.log('delete game');
        const currentMapGameInfo = this.gamePlayedInformation.get(id);
        if (currentMapGameInfo.numberOfGames === 0) {
            this.gamePlayedInformation.delete(id);
            await this.differenceClickService.deleteDifferences(id);
        } else {
            currentMapGameInfo.deleted = true;
            this.gamePlayedInformation.set(id, currentMapGameInfo);
        }
        console.log('map ', this.gamePlayedInformation);
    }
}
