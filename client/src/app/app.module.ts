import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { BestTimeComponent } from './components/best-time/best-time.component';
import { ClickEventComponent } from './components/click-event/click-event.component';
import { GameCardSelectionComponent } from './components/game-card-selection/game-card-selection.component';
import { GameConstantsComponent } from './components/game-constants/game-constants.component';
import { GameHistoryComponent } from './components/game-history/game-history.component';
import { ChosePlayerNameDialogComponent } from './modals/chose-player-name-dialog/chose-player-name-dialog.component';
import { ConfirmationModalComponent } from './modals/confirmation-modal/confirmation-modal/confirmation-modal.component';
import { GameInfoModalComponent } from './modals/game-info-modal/game-info-modal.component';
import { GameLoseModalComponent } from './modals/game-lose-modal/game-lose-modal.component';
import { GameWinModalComponent } from './modals/game-win-modal/game-win-modal.component';
import { LimitedTimeModalComponent } from './modals/limited-time-modal/limited-time-modal.component';
import { ModalPageComponent } from './modals/modal-page/modal-page.component';
import { QuitGameModalComponent } from './modals/quit-game-modal/quit-game-modal.component';
import { WaitingRoomComponent } from './modals/waiting-room/waiting-room.component';
import { GameCreationPageComponent } from './pages/game-creation-page/game-creation-page.component';
import { GameSelectionComponent } from './pages/game-selection/game-selection.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LimitedTimeComponent } from './pages/limited-time/limited-time.component';
import { SoloViewComponent } from './pages/solo-view/solo-view.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        HomePageComponent,
        MaterialPageComponent,
        GameSelectionComponent,
        BestTimeComponent,
        GameCardSelectionComponent,
        SoloViewComponent,
        ClickEventComponent,
        GameCreationPageComponent,
        ChosePlayerNameDialogComponent,
        WaitingRoomComponent,
        GameInfoModalComponent,
        QuitGameModalComponent,
        GameWinModalComponent,
        LimitedTimeComponent,
        GameHistoryComponent,
        GameConstantsComponent,
        GameLoseModalComponent,
        ConfirmationModalComponent,
        LimitedTimeModalComponent,
    ],
    entryComponents: [ModalPageComponent, LimitedTimeModalComponent],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatIconModule,
        MatTableModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
