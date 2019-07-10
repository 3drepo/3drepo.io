import { createBrowserHistory } from 'history';
import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';

import { IS_DEVELOPMENT } from '../constants/environment';
import createSagaMiddleware from 'redux-saga';
import createReducer from './reducers';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

const initialState = {};

export const history = createBrowserHistory();

function configureStore() {
	const middlewares = [
		sagaMiddleware,
		routerMiddleware(history)
	];

	const enhancers = [];

	if (IS_DEVELOPMENT) {
		// middlewares.unshift(require('redux-immutable-state-invariant').default());

		if (window.__REDUX_DEVTOOLS_EXTENSION__) {
			enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__());
		}
	}

	// tslint:disable-next-line: no-shadowed-variable
	const store = createStore(
		(state, action) => {
			if (action.type === 'RESET_APP') {
				state = undefined;
			}
			return createReducer(history)(state as any, action);
		},
		initialState,
		compose(
			applyMiddleware(...middlewares),
			...enhancers
		)
	);

	sagaMiddleware.run(rootSaga);

	return store;
}

export const store = configureStore();

export const dispatch = (action) => store.dispatch(action);

export const getState = store.getState;
