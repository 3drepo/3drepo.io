/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { put, takeLatest } from 'redux-saga/effects';
import { sortBy } from 'lodash';

import * as API from '../../services/api';
import { BimTypes, BimActions } from './bim.redux';
import { DialogActions } from '../dialog';
import { prepareMetadata } from '../../helpers/bim';
import { getAngularService } from '../../helpers/migration';

export function* fetchMetadata({ teamspace, model, metadataId }) {
	yield put(BimActions.setIsPending(true));

	try {
		const { data } = yield API.getMetadata(teamspace, model, metadataId);
		const PanelService = getAngularService('PanelService') as any;
		PanelService.showPanelsByType('docs');

		const sortedData = sortBy(prepareMetadata(data.meta[0].metadata), 'key');
		yield put(BimActions.fetchMetadataSuccess(sortedData));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'metadata', error));
	}

	yield put(BimActions.setIsPending(false));
}

export default function* BimSaga() {
	yield takeLatest(BimTypes.FETCH_METADATA, fetchMetadata);
}
