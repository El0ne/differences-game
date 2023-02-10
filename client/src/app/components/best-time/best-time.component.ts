import { Component, Input } from '@angular/core';
import { SecondToMinuteService } from '@app/services/second-t o-minute/second-to-minute.service';
import { RankingBoard } from '@common/ranking-board';

@Component({
    selector: 'app-best-time',
    templateUrl: './best-time.component.html',
    styleUrls: ['./best-time.component.scss'],
    providers: [SecondToMinuteService],
})
export class BestTimeComponent {
    @Input() rankingBoard: RankingBoard[];

    constructor(private service: SecondToMinuteService) {}

    timesConverted(time: number): string {
        return this.service.convert(time);
    }
}
