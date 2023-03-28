import { GameHistoryService } from '@app/services/game-history/game-history/game-history.service';
import { GameHistoryDTO } from '@common/game-history.dto';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('game-history')
export class GameHistoryController {
    constructor(private gameHistoryService: GameHistoryService) {}

    @Get('/')
    async getStages(@Res() res: Response): Promise<void> {
        try {
            const gameHistory = await this.gameHistoryService.getGameHistory();
            res.status(HttpStatus.OK).send(gameHistory);
        } catch (error) {
            throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('/')
    async createHistory(@Body() gameHistory: GameHistoryDTO, @Res() res: Response): Promise<void> {
        try {
            if (Object.keys(gameHistory).length) {
                const newGame = await this.gameHistoryService.addGameToHistory(gameHistory);
                res.status(HttpStatus.CREATED).send(newGame);
            } else res.sendStatus(HttpStatus.BAD_REQUEST);
        } catch (err) {
            throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete('/')
    async deleteHistory(@Res() res: Response): Promise<void> {
        try {
            await this.gameHistoryService.deleteGameHistory();
            res.status(HttpStatus.NO_CONTENT).send();
        } catch (err) {
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
