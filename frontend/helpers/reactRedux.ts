import createConnect from 'redux-connect-standalone';
import store from '../modules/store';

export const connect = createConnect(store);
