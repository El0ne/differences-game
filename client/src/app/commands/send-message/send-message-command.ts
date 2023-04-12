import { Command } from '@app/commands/command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';
import { RoomMessage } from '@common/chat-gateway-constants';

export class SendMessageCommand implements Command {
    soloView: SoloViewComponent;
    message: RoomMessage;

    constructor(soloView: SoloViewComponent, message: RoomMessage) {
        this.soloView = soloView;
        this.message = message;
    }

    execute(): void {
        this.soloView.messages.push(this.message);
        console.log('send message');
        console.log(' \n');
    }
}
