import createConnect from 'redux-connect-standalone';
import * as React from 'react';
import { Router } from 'react-router-dom';
import { invoke } from 'lodash';
import configureStore from '../modules/store';
import createBrowserHistory from 'history/createBrowserHistory';

// Angular service injector
export const getAngularService = (name, caller?) => angular.element(document.body).injector().get(name, caller);

// Should be replaced with proper react-redux connect if app is fully migrated
const initialState = {};
const store = configureStore(initialState);
export const connect = createConnect(store);

// Use to call react actions directly from AngularJS context
// Should be removed if app is fully migrated
export const dispatch = (action) => {
	return store.dispatch(action);
};

// Use to manually get store data directly from AngularJS context
// Should be removed if app is fully migrated
export const getState = store.getState;

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

export const runAngularTimeout = (callback, context?) => {
	const $timeout = getAngularService('$timeout', context) as (callback) => void;
	return $timeout(callback);
};

/* TODO: This custom hitory should be removed, if angular routes are migrated to react */
export const history = createBrowserHistory();

export const runAngularViewerTransition = (options) => {
	const $state = getAngularService('$state', this) as any;
	$state.go('app.viewer', options, { notify: false });
};

/* TODO: At the end Router should wrap whole app - not a specific component */
export const addRouting = (Component) => {
	return (props) => (
		<Router history={history}>
			<Component {...props} />
		</Router>
	);
};
