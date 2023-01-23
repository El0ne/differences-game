import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameCardSelectionComponent } from '@app/components/game-card-selection/game-card-selection.component';

const routes: Routes = [{ path: 'gameCard', component: GameCardSelectionComponent }];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
