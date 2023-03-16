/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { delay, put, takeLatest } from 'redux-saga/effects';
import { FetchDataAction, ViewerActions, ViewerTypes } from './viewer.redux';

function* fetchData({ teamspace, containerOrFederation, project, revision }: FetchDataAction) {
	yield put(ViewerActions.setFetching(true));
	console.log(` fetching data for ${JSON.stringify({ teamspace, containerOrFederation, project, revision })}`);
	yield delay(10000);
	yield put(ViewerActions.setFetching(false));
}

export default function* Viewer2Saga() {
	yield takeLatest(ViewerTypes.FETCH_DATA, fetchData);
}
