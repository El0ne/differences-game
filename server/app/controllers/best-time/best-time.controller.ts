import { BestTimeService } from '@app/services/best-time';
import { Controller, HttpException, HttpStatus, Query, Res } from '@nestjs/common';

@Controller('best-time')
export class BestTimeController {
    constructor(private bestTimeServive: BestTimeService) {}

    @Get('/')
    async getBestTimes(@Query('index') index: number, @Query('endIndex') endIndex: number, @Res() res: Response): Promise<void> {
        try {
            const bestTimes = await this.bestTimeService.getBestTimes(index, endIndex);
            res.status(HttpStatus.OK).send(bestTimes);
        } catch (error) {
            throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ******** TO BE POSTED THROUGH THE POST METHOD !!!!!!!!!!!!!!!!!!!!
    // defaultBestTimes(newGameName: string, gameMode: string): void {
    //     const firstPlace = {
    //         winner: 'Yvon Gagné',
    //         position: 1,
    //         gameName: newGameName,
    //         mode: gameMode,
    //     };
    //     const secondPlace = {
    //         winner: 'Pierre Laroche',
    //         position: 2,
    //         gameName: newGameName,
    //         mode: gameMode,
    //     };
    //     const thirdPlace = {
    //         winner: 'Joe Bleau',
    //         position: 3,
    //         gameName: newGameName,
    //         mode: gameMode,
    //     };
}
