// need it because the id_ attribute from MongoDb
/* eslint-disable no-underscore-dangle */
import { GameCard } from '@app/schemas/game-cards.schemas';
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { Injectable } from '@nestjs/common';

interface MapGameInfo {
    numberOfPlayers: number;
    isDeleted: boolean;
}

interface LimitedTimeGameInfo {
    gameStages: string[];
    playersInGame: number;
    readonly stagesUsed: string[];
}

@Injectable()
export class GameManagerService {
    gamePlayedInformation: Map<string, MapGameInfo> = new Map();
    limitedTimeModeGames: Map<string, LimitedTimeGameInfo> = new Map();

    constructor(
        private differenceClickService: DifferenceClickService,
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
    }

    async startLimitedTimeGame(room: string, numberOfPlayers: number): Promise<boolean> {
        const gameCards: GameCard[] = await this.gameCardService.getAllGameCards();
        const allStagesId: string[] = gameCards.map((gameCard) => {
            const stageId = gameCard._id.toString();
            this.addGame(stageId, numberOfPlayers);
            return stageId;
        });

        const isGameCardsPopulated = gameCards.length !== 0;
        if (isGameCardsPopulated) {
            for (let i = allStagesId.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp: string = allStagesId[i];
                allStagesId[i] = allStagesId[j];
                allStagesId[j] = temp;
            }

            this.limitedTimeModeGames.set(room, {
                gameStages: allStagesId,
                playersInGame: numberOfPlayers,
                stagesUsed: allStagesId.map((stageId) => stageId),
            });
        }
        return isGameCardsPopulated;
    }

    giveNextStage(room: string): string {
        const gameInfo: LimitedTimeGameInfo = this.limitedTimeModeGames.get(room);
        let randomStageInfo: string;
        if (gameInfo) {
            randomStageInfo = gameInfo.gameStages.pop();
        }
        return randomStageInfo;
    }

    removePlayerFromLimitedTimeGame(room: string): void {
        const gameInfo: LimitedTimeGameInfo = this.limitedTimeModeGames.get(room);
        if (gameInfo) {
            gameInfo.playersInGame -= 1;
            if (gameInfo.playersInGame === 0) {
                gameInfo.stagesUsed.forEach(async (stageId: string) => {
                    await this.endGame(stageId);
                });
                this.limitedTimeModeGames.delete(room);
            }
        }
    }

    async deleteFromMongo(id: string): Promise<void> {
        await this.differenceClickService.deleteDifferences(id);
        await this.imageManagerService.deleteImageObject(id);
    }
}
