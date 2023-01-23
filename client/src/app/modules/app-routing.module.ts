import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameSelectionComponent } from '@app/pages/game-selection/game-selection.component';

const routes: Routes = [{ path: 'selection', component: GameSelectionComponent }];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
