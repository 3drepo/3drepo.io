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
import { ModelActions } from '../model';
import { TYPES } from './../../routes/components/dialogContainer/components/revisionsDialog/revisionsDialog.constants';
import { DialogActions, DialogTypes } from './dialog.redux';

function* showRevisionsDialog({ config }) {
	try {
		const { teamspace, modelId, type } = config.data;

		if (type === TYPES.TEAMSPACES) {
			yield put(ModelActions.fetchRevisions(teamspace, modelId, true));
		}
	} catch (error) {
		yield put(DialogActions.showErrorDialog('show', 'revisions dialog', error));
	}
}

export default function* DialogSaga() {
	yield takeLatest(DialogTypes.SHOW_REVISIONS_DIALOG, showRevisionsDialog);
}
