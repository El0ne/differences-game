import { WriteMessageCommand } from '@app/commands/write-message/write-message';

describe('WriteMessageCommand', () => {
    let inputMock: HTMLInputElement;
    let command: WriteMessageCommand;

    beforeEach(() => {
        inputMock = document.createElement('input');
        command = new WriteMessageCommand(inputMock, 'hey');
    });

    it('should set the input value and trigger the input event', () => {
        spyOn(inputMock, 'dispatchEvent');

        command.execute();

        expect(inputMock.value).toEqual('hey');
        expect(inputMock.dispatchEvent).toHaveBeenCalledWith(new Event('input'));
    });
});
