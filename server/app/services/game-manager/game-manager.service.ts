/* eslint-disable no-underscore-dangle */
import { GameCard } from '@app/schemas/game-cards.schemas';
import { DifferenceClickService } from '@app/services/difference-click/difference-click.service';
import { GameCardService } from '@app/services/game-card/game-card.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
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
        private gameHistoryService: GameHistoryService,
        private gameCardService: GameCardService,
    ) {}

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

    async deleteGameFromDb(stageId: string): Promise<void> {
        const currentMapGameInfo = this.gamePlayedInformation.get(stageId);
        if (currentMapGameInfo) {
            currentMapGameInfo.isDeleted = true;
        } else {
            await this.differenceClickService.deleteDifferences(stageId);
        }
        await this.gameHistoryService.deleteGameHistory(stageId);
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
                // TODO test if no gameCArds are in bd when starting game
                const j = Math.floor(Math.random() * (i + 1));
                const temp: string = allStagesId[i];
                allStagesId[i] = allStagesId[j];
                allStagesId[j] = temp;
            }

            this.limitedTimeModeGames.set(room, {
                gameStages: allStagesId,
                playersInGame: numberOfPlayers,
                stagesUsed: allStagesId,
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
}
