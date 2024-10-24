/**
 *  Copyright (C) 2021 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { applyMiddleware, compose, createStore } from 'redux';

import createSagaMiddleware from 'redux-saga';
import { setStore } from '@/v5/helpers/redux.helpers';
import { IS_DEVELOPMENT } from '../constants/environment';
import createReducer from './reducers';

export const sagaMiddleware = createSagaMiddleware();

const initialState = {};

export const history = createBrowserHistory();

function configureStore() {
	const middlewares = [
		sagaMiddleware,
		routerMiddleware(history)
	];

	const enhancers = [];

	if (IS_DEVELOPMENT && window.__REDUX_DEVTOOLS_EXTENSION__) {
		enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__());
	}

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

	return store;
}

export const store = configureStore();


export const dispatch = store.dispatch;

export const getState = store.getState;

setStore(store);
