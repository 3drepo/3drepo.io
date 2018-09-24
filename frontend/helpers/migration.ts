import createConnect from 'redux-connect-standalone';
import React from 'react';
import { render } from 'react-dom';
import { invoke } from 'lodash';
import configureStore from '../modules/store';

// Angular service injector
const getAngularService = (name, caller?) => angular.element(document.body).injector().get(name, caller);

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
export const subscribe = (context, selectors: any = {}) => {
	const $timeout = getAngularService('$timeout', context) as (callback) => void;
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

	const handlerType = selectors.constructor.name.toLowerCase();

	store.subscribe(() => {
		$timeout(() => {
			const currentState = store.getState();
			const dataToBind = invoke(subscribeHandlers, handlerType, currentState) || {};

			Object.assign(context, dataToBind);
		});
	});
};
