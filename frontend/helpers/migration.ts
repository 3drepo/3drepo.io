import createConnect from 'redux-connect-standalone';
import React from 'react';
import { render } from 'react-dom';
import invoke from 'lodash/invoke';
import configureStore from '../modules/store';

// Should be replaced with proper react-redux connect if app is fully migrated
const initialState = {};
const store = configureStore(initialState);
export const connect = createConnect(store);

// Use to call react actions directly from AngularJS context
// Should be removed if app is fully migrated
export const dispatch = (action) => {
	return store.dispatch(action);
};

// Use to listen store changes directly from AngularJS context
// Should be removed if app is fully migrated
export const subscribe = (context, selectors = {}) => {
	const subscribeHandlers = {
		function: selectors,
		object: (currentState) => {
			const dataToBind = {};
			for (const fieldName in selectors) {
				if (selectors.hasOwnProperty(fieldName)) {
					const select = selectors[fieldName];
					dataToBind[fieldName] = select(currentState);
				}
			}
			return dataToBind;
		}
	};

	const handlerType = typeof selectors;

	store.subscribe(() => {
		const currentState = store.getState();
		const dataToBind = invoke(subscribeHandlers, handlerType, currentState) || {};

		Object.assign(context, dataToBind);
	});
};
