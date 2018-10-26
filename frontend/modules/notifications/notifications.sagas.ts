/**
 *  Copyright (C) 2018 3D Repo Ltd
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

import { put, takeLatest, select} from 'redux-saga/effects';

import api, * as API from '../../services/api';
import { NotificationsTypes, NotificationsActions } from './notifications.redux';
import { DialogActions } from '../dialog';

function selectNotification(id, state) {
	return state.notifications.find((n) => n._id === id );
}

export function* fetchNotifications() {
	const resp = yield API.getNotifications();
	yield put(NotificationsActions.fetchNotificationsSuccess(resp.data));
}

export function* markNotificationAsRead({ notificationId }) {
	try {
		const notification = yield select(selectNotification.bind(null, notificationId));
		if (notification.read) {
			return;
		}
		yield put(NotificationsActions.patchNotification({_id: notificationId, read: true}));
		const resp = yield API.patchNotification(notificationId, {read: true});
	} catch (error) {
		yield put(NotificationsActions.patchNotification({_id: notificationId, read: true}));
		yield put(DialogActions.showErrorDialog('update', 'notification', error.response));
	}
}

export default function* NotificationsSaga() {
	yield takeLatest(NotificationsTypes.FETCH_NOTIFICATIONS, fetchNotifications);
	yield takeLatest(NotificationsTypes.MARK_NOTIFICATION_AS_READ, markNotificationAsRead);
}
