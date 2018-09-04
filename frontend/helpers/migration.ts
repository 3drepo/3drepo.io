import createConnect from 'redux-connect-standalone';
import store from '../modules/store';
import React from 'react';
import { render } from 'react-dom';

// Should be replaced with proper react-redux connect if app is fully migrated
export const connect = createConnect(store);
