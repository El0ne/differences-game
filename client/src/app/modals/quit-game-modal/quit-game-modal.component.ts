import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';
import { PlayersInformation } from '@common/chat-dialog-constants';

@Component({
    selector: 'app-quit-game-modal',
    templateUrl: './quit-game-modal.component.html',
    styleUrls: ['./quit-game-modal.component.scss'],
})
export class QuitGameModalComponent {
    image: string = '../../../assets/crying-black-guy-meme.gif';
    // eslint-disable-next-line max-params
    constructor(
        private matDialogRef: MatDialogRef<QuitGameModalComponent>,
        private router: Router,
        private chat: SocketService,
        @Inject(MAT_DIALOG_DATA) public abandon: PlayersInformation,
    ) {}

    confirm(): void {
        this.chat.send('abandon', { name: this.abandon.player, room: this.abandon.room });
        this.matDialogRef.close();
        this.router.navigate(['/stage-selection']);
    }

    cancel(): void {
        this.matDialogRef.close();
    }
}
