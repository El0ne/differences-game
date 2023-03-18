import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { Injectable } from '@nestjs/common';

interface MapGameInfo {
    numberOfPlayers: number;
    isDeleted: boolean;
}
@Injectable()
export class GameManagerService {
    gamePlayedInformation: Map<string, MapGameInfo> = new Map();

    constructor(private differenceClickService: DifferenceClickService) {}

    async endGame(stageId: string): Promise<void> {
        const currentMapGameInfo = this.gamePlayedInformation.get(stageId);
        if (currentMapGameInfo) {
            currentMapGameInfo.numberOfPlayers -= 1;
            if (currentMapGameInfo.numberOfPlayers === 0) {
                if (currentMapGameInfo.isDeleted) {
                    await this.differenceClickService.deleteDifferences(stageId);
                }
                this.gamePlayedInformation.delete(stageId);
            }
        }
        console.log('this.gamePlayedInformation', this.gamePlayedInformation);
    }

    addGame(stageId: string, numberOfPlayers: number): void {
        const currentMapGameInfo = this.gamePlayedInformation.get(stageId);
        if (currentMapGameInfo) {
            currentMapGameInfo.numberOfPlayers += numberOfPlayers;
        } else {
            this.gamePlayedInformation.set(stageId, {
                numberOfPlayers,
                isDeleted: false,
            });
        }
        console.log('map ', this.gamePlayedInformation);
    }

    async deleteGame(stageId: string): Promise<void> {
        // console.log('delete game');
        const currentMapGameInfo = this.gamePlayedInformation.get(stageId);
        if (currentMapGameInfo) {
            currentMapGameInfo.isDeleted = true;
        } else {
            await this.differenceClickService.deleteDifferences(stageId);
        }
        console.log('map ', this.gamePlayedInformation);
    }
}
