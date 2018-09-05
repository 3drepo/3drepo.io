import createConnect from 'redux-connect-standalone';
import React from 'react';
import { render } from 'react-dom';
import configureStore from '../modules/store';

// Should be replaced with proper react-redux connect if app is fully migrated
const initialState = {};
const store = configureStore(initialState);
debugger
export const connect = createConnect(store);
