import { all, fork } from 'redux-saga/effects';
import teamspaceSaga from './teamspace/teamspace.sagas';

export default function* rootSaga() {
	yield all([
		fork(teamspaceSaga)
	]);
}
