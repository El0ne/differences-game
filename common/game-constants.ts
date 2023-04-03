export interface GameConstants {
    countDown: number;
    hint: number;
    difference: number;
}

export const getDefaultGameConstants = (): GameConstants => {
    return {
        countDown: 30,
        hint: 5,
        difference: 5,
    };
};
