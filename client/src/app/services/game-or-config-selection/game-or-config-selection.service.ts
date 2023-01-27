import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class GameOrConfigSelectionService {
    isConfigView: boolean;

    setConfig() {
        this.isConfigView = true;
    }

    setGame() {
        this.isConfigView = false;
    }

    getConfigView(): boolean {
        return this.isConfigView;
    }
}
