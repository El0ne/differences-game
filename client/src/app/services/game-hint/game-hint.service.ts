import { Injectable } from '@angular/core';
import { HEIGHT, WIDTH } from '@app/components/click-event/click-event-constant';
import { APPROXIMATE_RADIUS, FOUR, MAX_RGB_VALUE, MINIMUM_RADIUS } from './game-hint-constants';

@Injectable({
    providedIn: 'root',
})
export class GameHintService {
    hintsRemaining: number;

    constructor() {
        this.hintsRemaining = 3;
    }

    getPercentages(positions: number[]): number[] {
        this.hintsRemaining -= 1;
        return this.getCornerPosition([positions[0] / WIDTH, positions[1] / HEIGHT]);
    }

    getCornerPosition(positions: number[]): number[] {
        const corners = [];
        for (const position of positions) {
            if (this.hintsRemaining === 2) {
                corners.push(Math.floor(position * 2) / 2);
            } else if (this.hintsRemaining === 1) {
                corners.push(Math.floor(position * FOUR) / FOUR);
            }
        }
        return corners;
    }

    setColor(clickPosition: number[], hintPosition: number[]): string {
        const radius = Math.sqrt((clickPosition[0] - hintPosition[0]) ** 2 + (clickPosition[1] - hintPosition[1]) ** 2);

        const red = Math.round((MAX_RGB_VALUE * radius) / APPROXIMATE_RADIUS);
        const blue = Math.round(MAX_RGB_VALUE * (1 - radius / APPROXIMATE_RADIUS));

        if (radius < MINIMUM_RADIUS) return '#FF2D00';
        else return `rgb(${blue}, 0, ${red})`;
    }
}
