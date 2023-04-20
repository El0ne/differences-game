import { ClickCommand } from '@app/commands/click/click-command';
import { ClickEventComponent } from '@app/components/click-event/click-event.component';
import { ClickDifferenceVerification } from '@common/click-difference-verification';

describe('ClickCommand', () => {
    let clickCommand: ClickCommand;
    let clickEventMock: ClickEventComponent;
    let dataMock: ClickDifferenceVerification;
    let mouseEventMock: MouseEvent;

    beforeEach(() => {
        // create mock instances
        clickEventMock = jasmine.createSpyObj(['emitToSoloView']);
        dataMock = {
            isADifference: true,
            differenceArray: [1, 2, 3],
            differencesPosition: 0,
        };
        mouseEventMock = new MouseEvent('click', {
            clientX: 100,
            clientY: 200,
        });
        // create the command instance
        clickCommand = new ClickCommand(clickEventMock, dataMock, mouseEventMock);
    });

    it('should call emitToSoloView method of ClickEventComponent when execute is called', () => {
        clickCommand.execute();
        expect(clickEventMock.emitToSoloView).toHaveBeenCalledWith(dataMock, mouseEventMock);
    });
});
