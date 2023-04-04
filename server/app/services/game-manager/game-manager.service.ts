/* eslint-disable no-underscore-dangle */
import { GameCard } from '@app/schemas/game-cards.schemas';
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { StageInformation } from '@common/game-card';
import { Injectable } from '@nestjs/common';
import { ImageManagerService } from '../image-manager/image-manager.service';

interface MapGameInfo {
    numberOfPlayers: number;
    isDeleted: boolean;
}

interface LimitedTimeGameInfo {
    stageInfo: StageInformation[];
    playersInGame: number;
    readonly stagesUsed: string[];
}

@Injectable()
export class GameManagerService {
    gamePlayedInformation: Map<string, MapGameInfo> = new Map();
    limitedTimeModeGames: Map<string, LimitedTimeGameInfo> = new Map();

    constructor(
        private differenceClickService: DifferenceClickService,
        private gameHistoryService: GameHistoryService,
        private gameCardService: GameCardService,
        private imageManagerService: ImageManagerService,
    ) {}

    async endGame(stageId: string): Promise<void> {
        const currentMapGameInfo = this.gamePlayedInformation.get(stageId);
        if (currentMapGameInfo) {
            currentMapGameInfo.numberOfPlayers -= 1;
            if (currentMapGameInfo.numberOfPlayers === 0) {
                if (currentMapGameInfo.isDeleted) {
                    this.deleteFromMongo(stageId);
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

    async deleteGameFromDb(stageId: string): Promise<void> {
        const currentMapGameInfo = this.gamePlayedInformation.get(stageId);
        if (currentMapGameInfo) {
            currentMapGameInfo.isDeleted = true;
        } else {
            this.deleteFromMongo(stageId);
        }
        // await this.gameHistoryService.deleteGameHistory(stageId);
    }

    async startLimitedTimeGame(room: string, numberOfPlayers: number): Promise<void> {
        const gameCards: GameCard[] = await this.gameCardService.getAllGameCards();
        const stageInformations: StageInformation[] = gameCards.map((gameCard) => {
            const stageId = gameCard._id.toString();

            this.addGame(stageId, numberOfPlayers);
            return {
                _id: stageId,
                // TODO fix with Alexis
                originalImageName: 'gameCard.originalImageName',
                differenceImageName: 'gameCard.differenceImageName',
            };
        });

        // randomize gameCards
        for (let i = stageInformations.length - 1; i > 0; i--) {
            // TODO test if no gameCArds are in bd when starting game
            const j = Math.floor(Math.random() * (i + 1));
            const temp: StageInformation = stageInformations[i];
            stageInformations[i] = stageInformations[j];
            stageInformations[j] = temp;
        }

        this.limitedTimeModeGames.set(room, {
            stageInfo: stageInformations,
            playersInGame: numberOfPlayers,
            stagesUsed: gameCards.map((stage) => stage._id.toString()),
        });
    }

    giveNextLimitedTimeStage(room: string): StageInformation {
        const gameInfo: LimitedTimeGameInfo = this.limitedTimeModeGames.get(room);
        let randomStageInfo: StageInformation;
        if (gameInfo) {
            randomStageInfo = gameInfo.stageInfo.pop();
            // if array is empty
            if (!randomStageInfo) {
                for (let i = 0; i < gameInfo.playersInGame; i++) {
                    this.removePlayerFromLimitedTimeGame(room);
                }
            }
        }
        return randomStageInfo; // if returns undefined, means game is finished
    }

    removePlayerFromLimitedTimeGame(room: string): void {
        const gameInfo: LimitedTimeGameInfo = this.limitedTimeModeGames.get(room);
        if (gameInfo) {
            gameInfo.playersInGame -= 1;
            if (gameInfo.playersInGame === 0) {
                gameInfo.stagesUsed.forEach((stageId: string) => {
                    this.endGame(stageId);
                });
                this.limitedTimeModeGames.delete(room);
            }
        }
    }

    async deleteFromMongo(id: string): Promise<void> {
        await this.differenceClickService.deleteDifferences(id);
        // TODO delete images and delete image object
        await this.imageManagerService.deleteImageObject(id);
    }
}
