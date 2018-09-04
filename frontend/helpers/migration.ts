import createConnect from 'redux-connect-standalone';
import store from '../modules/store';

// Should be replaced with proper react-redux connect if app is fully migrated
export const connect = createConnect(store);
