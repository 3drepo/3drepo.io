/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { createStore, combineReducers, applyMiddleware, Action } from 'redux';
import reducers from '@/v5/store/reducers';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '@/v4/modules/sagas';
import { isEqual, isFunction } from 'lodash';
import { getWaitablePromise } from '@/v5/helpers/async.helpers';


export type WaitActionCallback = ((state?: object, action?:Action, previousState?: object) => boolean);
export type WaitAction = (Action | string | WaitActionCallback) ;
export type WaitForActions = (dispatchingfunction: () => any, waitActions: WaitAction[], debugActions?: boolean) => void;

// A different Node version between the backend and the frontend
// is causing a problem with axios when files are sent to an endpoint.
// This is a workaround for that.
export const spyOnAxiosApiCallWithFile = (api, method) => {
	const methodFn = api[method];
	return jest.spyOn(api, method).mockImplementation((url, body) => {
		// Transforms the formData to a string to avoid a problem with axios
		// in its node implementation.
		return methodFn(url, body.toString());
	});
};

export const createTestStore = () => {
	let waitingActions: WaitAction[] = [];
	let resolvePromise;
	let debugActions = false;

	const sagaMiddleware = createSagaMiddleware();
	const middlewares = applyMiddleware(sagaMiddleware);

	const discountMatchingActions =  (state: object, action: Action, previousState: object) => {
		const waitingAction = waitingActions[0];
	
		const successStep = isFunction(waitingAction) ? waitingAction(state, action, previousState) : false;

		if (action.type === waitingAction || isEqual(waitingAction, action) || successStep) {
			waitingActions.shift();
		}
	
		return waitingActions.length === 0;
	};

	const mainReducer = combineReducers(reducers);


	const store = createStore((state: any, action) =>{
		const st = mainReducer(state, action);		

		if (debugActions) {
			console.log(JSON.stringify({
				dispatchedAction: action,
				waitingAction: waitingActions[0],
			}, null, '\t'));
		}

		if (discountMatchingActions(st, action, state) && resolvePromise) {
			resolvePromise(true);
			resolvePromise = null;
		}
		
		return st;
	}		
	, middlewares);
	
	const waitForActions:WaitForActions = (dispatchingfunction, waitActions, debug?: boolean) =>  { 
		waitingActions = waitActions;
		const { resolve, promiseToResolve } = getWaitablePromise();
		resolvePromise = resolve;
		dispatchingfunction();

		debugActions = debug;
		return promiseToResolve;
	}

	sagaMiddleware.run(rootSaga);
	return {...store, waitForActions};
};

export const listContainsElementWithId = (list, element) => (	
	list.map(({ _id }) => _id).includes(element._id)
);

export const findById = <T extends { _id: string }>(list: T[], _id:string):T | null => list.find((item) => item._id === _id);