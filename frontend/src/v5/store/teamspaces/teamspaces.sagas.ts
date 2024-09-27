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

import { put, select, take, takeLatest } from 'redux-saga/effects';

import * as API from '@/v5/services/api';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { formatMessage } from '@/v5/services/intl';
import { TeamspacesActions, TeamspacesTypes, ITeamspace } from './teamspaces.redux';
import { RELOAD_PAGE_OR_CONTACT_SUPPORT_ERROR_MESSAGE } from '../store.helpers';
import { selectIsFetchingAddons } from './teamspaces.selectors';
import { formatFilenameDate } from '@/v5/helpers/intl.helper';

export function* fetch() {
	yield put(TeamspacesActions.setTeamspacesArePending(true));
	try {
		const { data: { teamspaces } }: { data: { teamspaces: ITeamspace[] } } = yield API.Teamspaces.fetchTeamspaces();
		yield put(TeamspacesActions.fetchSuccess(teamspaces));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({
				id: 'teamspaces.fetch.error.action',
				defaultMessage: 'loading your Teamspaces',
			}),
			error,
			details: RELOAD_PAGE_OR_CONTACT_SUPPORT_ERROR_MESSAGE,
		}));
	}
	yield put(TeamspacesActions.setTeamspacesArePending(false));
}

export function* fetchQuota({ teamspace }) {
	try {
		const { data } = yield API.Teamspaces.fetchQuota(teamspace);
		yield put(TeamspacesActions.fetchQuotaSuccess(teamspace, data));
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({
				id: 'teamspaces.fetchQuota.error.action',
				defaultMessage: 'fetching the quota',
			}),
			error,
			details: RELOAD_PAGE_OR_CONTACT_SUPPORT_ERROR_MESSAGE,
		}));
	}
}

export function* waitForAddons() {
	const isFetchingAddons = yield select(selectIsFetchingAddons);

	if (isFetchingAddons) {
		yield take(TeamspacesTypes.FETCH_ADD_ONS_SUCCESS);
	}
}

export function* fetchActivityLog({ teamspace, startDate, endDate }) {
	try {
		const log = yield API.Teamspaces.fetchActivityLog(teamspace, startDate, endDate);
		const url = window.URL.createObjectURL(new Blob([log]));
		const link = document.createElement('a');
		link.href = url;
		const range = [startDate, endDate].filter(Boolean).map((date) => formatFilenameDate(date)).join('__');
		link.download = formatMessage({ id: 'teamspaces.fetchActivityLog.filename', defaultMessage: 'activity_log_{range}.zip' }, { range });
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	} catch (error) {
		yield put(DialogsActions.open('alert', {
			currentActions: formatMessage({
				id: 'teamspaces.fetchActivityLog.error.action',
				defaultMessage: 'fetching the activity log',
			}),
			error,
			details: RELOAD_PAGE_OR_CONTACT_SUPPORT_ERROR_MESSAGE,
		}));
	}
}

export default function* TeamspacesSaga() {
	yield takeLatest(TeamspacesTypes.FETCH as any, fetch);
	yield takeLatest(TeamspacesTypes.FETCH_QUOTA as any, fetchQuota);
	yield takeLatest(TeamspacesTypes.FETCH_ACTIVITY_LOG as any, fetchActivityLog);
}
