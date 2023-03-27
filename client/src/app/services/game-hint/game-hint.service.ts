import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class GameHintService {
    getPercentages(positions: number[]): number[] {
        return this.getCornerPosition([positions[0] / 640, positions[1] / 480]);
    }

    getCornerPosition(positions: number[]): number[] {
        const corners = [];
        for (const position of positions) {
            corners.push(this.roundDown(position));
        }
        return corners;
    }

    roundDown(toRoundDown: number): number {
        if (toRoundDown < 0.25) {
            return 0;
        } else if (toRoundDown < 0.5) {
            return 0.25;
        } else if (toRoundDown < 0.75) {
            return 0.5;
        } else {
            return 0.75;
        }
    }
}
