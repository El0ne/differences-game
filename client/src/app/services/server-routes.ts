import { environment } from 'src/environments/environment';
const SERVER_URL = environment.serverUrl;
export const STAGE = `${SERVER_URL}/stage`;
export const CLICK = `${SERVER_URL}/game-click`;
export const BEST_TIME = `${SERVER_URL}/best-time`;
