import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
<<<<<<< client/src/app/modules/app-routing.module.ts
import { GameCardSelectionComponent } from '@app/components/game-card-selection/game-card-selection.component';
=======
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameSelectionComponent } from '@app/pages/game-selection/game-selection.component';
>>>>>>> client/src/app/modules/app-routing.module.ts
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'gameCard', component: GameCardSelectionComponent },
    { path: 'selection', component: GameSelectionComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
