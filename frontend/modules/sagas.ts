import { all, fork } from 'redux-saga/effects';
import teamspaceSaga from './teamspace/teamspace.sagas';
// <-- IMPORT MODULE SAGA -->

export default function* rootSaga() {
	yield all([
		fork(teamspaceSaga)// <-- INJECT MODULE SAGA -->
	]);
}
