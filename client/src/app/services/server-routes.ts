import { environment } from 'src/environments/environment';
const SERVER_URL = environment.serverUrl;
export const STAGE = `${SERVER_URL}/stage`;
export const IMAGE = `${SERVER_URL}/image`;
export const CLICK = `${SERVER_URL}/game-click`;
export const GAME_CONSTANTS = `${SERVER_URL}/game-constants`;
export const GAME_HISTORY = `${SERVER_URL}/game-history`;
