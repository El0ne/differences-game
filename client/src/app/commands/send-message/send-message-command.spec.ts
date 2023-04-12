import { SendMessageCommand } from '@app/commands/send-message/send-message-command';
import { SoloViewComponent } from '@app/pages/solo-view/solo-view.component';
import { RoomMessage } from '@common/chat-gateway-constants';

describe('SendMessageCommand', () => {
    let soloViewMock: SoloViewComponent;
    let message: RoomMessage;
    let command: SendMessageCommand;

    beforeEach(() => {
        soloViewMock = {
            messages: [],
            messageContent: '',
        } as unknown as SoloViewComponent;

        message = {
            socketId: '1234',
            message: 'Hey',
            event: 'chat',
        };

        command = new SendMessageCommand(soloViewMock, message);
    });

    it('should add message to messages array and clear messageContent', () => {
        command.execute();

        expect(soloViewMock.messages).toContain(message);
        expect(soloViewMock.messageContent).toEqual('');
    });
});
