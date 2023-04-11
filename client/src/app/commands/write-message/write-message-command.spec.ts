import { WriteMessageCommand } from './write-message';

describe('WriteMessageCommand', () => {
    it('should create an instance', () => {
        expect(new WriteMessageCommand(new HTMLInputElement(), '')).toBeTruthy();
    });
});
