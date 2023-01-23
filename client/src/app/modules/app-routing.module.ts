import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameSelectionComponent } from '@app/pages/game-selection/game-selection.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'gameCard', component: MainPageComponent },
    { path: 'soloGame', component: MainPageComponent },
    { path: 'waitingRoom', component: MainPageComponent },
    /*
    Utiliser ces paths au lieu, lorsque ces composantes seront creees!
    { path: 'gameCard', component: GameCardComponent },
    { path: 'soloGame', component: PlaySoloComponent },
    { path: 'waitingRoom', component: WaitingRoomComponent },
    */
    { path: 'selection', component: GameSelectionComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
