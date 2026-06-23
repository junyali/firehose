import type { App } from '@slack/bolt';
import listener from './listener.js';

function register(_app: App) {

}

export { register, listener as messageListener };
