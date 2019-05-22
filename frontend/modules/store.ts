import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import createReducer from './reducers';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(initialState = {}) {
	const middlewares = [
		require('redux-immutable-state-invariant').default(),
		sagaMiddleware
	];

	const enhancers = [];

	if (window.__REDUX_DEVTOOLS_EXTENSION__) {
		enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__());
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
