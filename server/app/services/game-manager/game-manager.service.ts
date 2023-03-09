import { Injectable } from '@nestjs/common';

@Injectable()
export class GameManagerService {
    // map <id, {nbParties: number , deleted: boolean}>

    constructor() {}

    endGame(id: string) {
        console.log('Game ended:', id);
    }
}
