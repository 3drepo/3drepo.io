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

import { isNotAuthed } from '@/v5/validation/errors.helpers';
import { DialogsActions as V5DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { TYPES } from '../../routes/components/dialogContainer/components/revisionsDialog/revisionsDialog.constants';
import { ModelActions } from '../model';
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

function* showEndpointErrorDialog(data) {
	const { error, method, dataType } = data;
	if (isNotAuthed(error)) {
		yield put(V5DialogsActions.open('alert', {
			currentActions: `trying to ${method} the ${dataType}:`,
			error,
		}));
	} else {
		yield put(DialogActions.showEndpointErrorDialogSuccess(data));
	}
};

export default function* DialogSaga() {
	yield takeLatest(DialogTypes.SHOW_REVISIONS_DIALOG, showRevisionsDialog);
	yield takeLatest(DialogTypes.SHOW_ENDPOINT_ERROR_DIALOG, showEndpointErrorDialog);
}
