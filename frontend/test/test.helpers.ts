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
import { all, fork, getContext, setContext, take } from 'redux-saga/effects';
import { ViewerTypes } from '@/v5/store/viewer/viewer.redux';

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


// let sagaPromise = null;
// let waitPatterns = [];
// export const getSagaPromise = (...wait) => {
// 	waitPatterns = wait;
// 	sagaPromise;
// }

export const createTestStore = () => {
	let middlewares = undefined;
	let waitingActions = [];

	const sagaMiddleware = createSagaMiddleware();
	
	middlewares = applyMiddleware(sagaMiddleware);

	const actionsCounter = function* (waitingActions: Action[]){
		while (waitingActions.length > 0){
			const action = yield;
			if (waitingActions[0].type == )
			 false;
		}

		return true;
	};

	
	const store = createStore(combineReducers({...reducers,
	 spy: (state, action) =>
		if (actionsCounter) {

		}
		return state;
	}), middlewares);
	
	const waitForSaga = (func) =>  { 
		// setContext({waitingPatterns});
		// func();


		return promise;
	}

	// sagaMiddleware.run(function* () {
	// 	yield(all([
	// 		fork(rootSaga),
	// 		fork(function * () {
	// 			const pp = {resolve: null};
	// 			const waitingPatterns: string[] =  yield getContext('waitingPatterns');
	// 			console.log(waitingPatterns);
	// 			const sagaPromise = new Promise(resolve =>  pp.resolve = resolve);
	// 			yield setContext({promise: sagaPromise});
	// 			for (const p of waitingPatterns) {
	// 				yield take(p);
	// 			}
	// 			pp.resolve();
	// 		})
	// 	]))
	// });

	sagaMiddleware.run(rootSaga);
	return {...store, waitForSaga};
};

export const listContainsElementWithId = (list, element) => (	
	list.map(({ _id }) => _id).includes(element._id)
);
