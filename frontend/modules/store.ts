import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import createReducer from './reducers';
import rootSaga from './sagas';
import { IS_DEVELOPMENT } from '../constants/environment';

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(initialState = {}) {
	const middlewares = [
		sagaMiddleware
	];

	const enhancers = [];

	if (IS_DEVELOPMENT) {
		middlewares.unshift(require('redux-immutable-state-invariant').default());

		if (window.__REDUX_DEVTOOLS_EXTENSION__) {
			enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__());
		}
	}

	const store = createStore(
		(state, action) => {
			if (action.type === 'RESET_APP') {
				state = undefined;
			}
			return createReducer()(state as any, action);
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
