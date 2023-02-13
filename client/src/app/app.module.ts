import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { BestTimeComponent } from './components/best-time/best-time.component';
import { GameCardSelectionComponent } from './components/game-card-selection/game-card-selection.component';
import { GameCreationPageComponent } from './pages/game-creation-page/game-creation-page.component';
import { GameSelectionComponent } from './pages/game-selection/game-selection.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
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
        GameCreationPageComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, MatIconModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
