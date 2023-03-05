import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChatSocketService } from '@app/services/chat-socket/chat-socket.service';
import { PlayersInformation } from '@common/chat-dialog-constants';

@Component({
    selector: 'app-quit-game-modal',
    templateUrl: './quit-game-modal.component.html',
    styleUrls: ['./quit-game-modal.component.scss'],
})
export class QuitGameModalComponent {
    // eslint-disable-next-line max-params
    constructor(
        public matDialogRef: MatDialogRef<QuitGameModalComponent>,
        public router: Router,
        private chat: ChatSocketService,
        @Inject(MAT_DIALOG_DATA) public abandon: PlayersInformation,
    ) {}

    confirm() {
        this.chat.send('abandon', { name: this.abandon.player, room: this.abandon.room });
        this.matDialogRef.close();
        this.router.navigate(['/stage-selection']);
    }

    cancel() {
        this.matDialogRef.close();
    }
}
