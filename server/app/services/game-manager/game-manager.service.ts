/* eslint-disable no-underscore-dangle */
import { GameCard } from '@app/schemas/game-cards.schemas';
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { StageInformation } from '@common/game-card';
import { Injectable } from '@nestjs/common';

interface MapGameInfo {
    numberOfPlayers: number;
    isDeleted: boolean;
}

interface LimitedTimeGameInfo {
    stageInfo: StageInformation[];
    playersInGame: number;
    stagesUsed: string[];
}

@Injectable()
export class GameManagerService {
    gamePlayedInformation: Map<string, MapGameInfo> = new Map();
    limitedTimeModeGames: Map<string, LimitedTimeGameInfo> = new Map();

    constructor(private differenceClickService: DifferenceClickService, private gameCardService: GameCardService) {}

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
    }

    async deleteGame(stageId: string): Promise<void> {
        const currentMapGameInfo = this.gamePlayedInformation.get(stageId);
        if (currentMapGameInfo) {
            currentMapGameInfo.isDeleted = true;
        } else {
            await this.differenceClickService.deleteDifferences(stageId);
        }
    }

    async startLimitedTimeGame(room: string, numberOfPlayers: number): Promise<void> {
        const gameCards: GameCard[] = await this.gameCardService.getAllGameCards();
        const stageInformations: StageInformation[] = gameCards.map((gameCard) => {
            const stageId = gameCard._id.toString();

            this.addGame(stageId, numberOfPlayers);
            return {
                _id: stageId,
                originalImageName: gameCard.originalImageName,
                differenceImageName: gameCard.differenceImageName,
            };
        });
        this.limitedTimeModeGames.set(room, {
            stageInfo: stageInformations,
            playersInGame: numberOfPlayers,
            stagesUsed: gameCards.map((stage) => stage._id.toString()),
        });
    }
}
