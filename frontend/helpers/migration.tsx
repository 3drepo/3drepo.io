import configureStore from '../modules/store';
import { createBrowserHistory } from 'history';

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
