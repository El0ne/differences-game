import { Injectable } from '@angular/core';

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
        return this.getCornerPosition([positions[0] / 640, positions[1] / 480]);
    }

    getCornerPosition(positions: number[]): number[] {
        const corners = [];
        for (const position of positions) {
            switch (this.hintsRemaining) {
                case 2: {
                    corners.push(this.roundDownFour(position));
                    break;
                }
                case 1: {
                    corners.push(this.roundDown(position));
                    break;
                }
            }
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

    roundDownFour(toRoundDown: number): number {
        if (toRoundDown < 0.5) {
            return 0;
        } else {
            return 0.5;
        }
    }

    setColor(clickPosition: number[], hintPosition: number[]): string {
        const radius = Math.sqrt((clickPosition[0] - hintPosition[0]) ** 2 + (clickPosition[1] - hintPosition[1]) ** 2);
        if (radius < 50) {
            return '#881901';
        } else if (radius < 100) return '#FF2D00';
        else if (radius < 150) return '#FF8EBC';
        else if (radius < 200) return '#A5D7FF';
        else if (radius < 250) return '#4575FF';
        else return '#0042FF';
    }
}
