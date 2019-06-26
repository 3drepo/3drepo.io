import { invoke } from 'lodash';
import configureStore from '../modules/store';
import { createBrowserHistory } from 'history';

// Angular service injector
export const getAngularService = (name, caller?) => angular.element(document.body).injector().get(name, caller);

// Should be replaced with proper react-redux connect if app is fully migrated
const initialState = {};
export const history = createBrowserHistory();

export const store = configureStore(initialState, history);

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

	return store.subscribe(() => {
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

export const runAngularViewerTransition = (options) => {
	const $state = getAngularService('$state', this) as any;
	$state.go('app.viewer', options, { notify: false });
};
