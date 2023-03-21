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
import { isEqual } from 'lodash';

export const alertAction = (currentAction: string) => ({
	action: {
		type: 'MODALS/OPEN',
		modalType: 'alert',
		props: {
			currentActions: currentAction,
		},
	},
});

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
	let middlewares = undefined;
	let waitingActions: Action[] | string[] = [];
	let resolvePromiseObj = { resolvePromise: null };

	const sagaMiddleware = createSagaMiddleware();
	
	middlewares = applyMiddleware(sagaMiddleware);

	const discountMatchingActions =  (action: Action) => {
		const waitingAction = waitingActions[0];

		if (action.type === waitingAction || isEqual(waitingAction, action)) {
			waitingActions.shift();
		}
	
		return waitingActions.length === 0;
	};

	const store = createStore(combineReducers(
		{
			...reducers,
			spyActions: (state, action) => {
				const { resolvePromise } = resolvePromiseObj;

				console.log(resolvePromiseObj.resolvePromise);

				if (discountMatchingActions(action) && resolvePromise) {
					resolvePromise(true);
					resolvePromiseObj.resolvePromise = null;
				}
				return {};
			}
		}
	), middlewares);
	
	const waitForActions = (func, waitActions) =>  { 
		waitingActions = waitActions;
		var promise = new Promise((resolve) => {resolvePromiseObj.resolvePromise = resolve;});
		func();
		return promise;
	}

	sagaMiddleware.run(rootSaga);
	return {...store, waitForActions};
};

export const listContainsElementWithId = (list, element) => (	
	list.map(({ _id }) => _id).includes(element._id)
);
