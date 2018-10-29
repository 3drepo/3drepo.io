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
import { DIALOG_TYPES } from '../dialog/dialog.redux';

function selectNotifications(state) {
	return state.notifications;
}

function selectNotification(id, state) {
	return state.notifications.find((n) => n._id === id );
}

export function* sendGetNotifications() {
	const resp = yield API.getNotifications();
	yield put(NotificationsActions.setNotifications(resp.data));
}

export function* sendUpdateNotificationRead({ notificationId, read }) {
	try {
		const notification = yield select(selectNotification.bind(null, notificationId));
		if (notification.read === read) {
			return;
		}
		yield put(NotificationsActions.patchNotification({_id: notificationId, read}));
		const resp = yield API.patchNotification(notificationId, {read});
	} catch (error) {
		yield put(NotificationsActions.patchNotification({_id: notificationId, read: !read}));
		yield put(DialogActions.showErrorDialog('update', 'notification', error.response));
	}
}

export function* sendDeleteNotification({ notificationId }) {
	const notification = yield select(selectNotification.bind(null, notificationId));
	if (!notification) {
		return;
	}

	try {
		yield put(NotificationsActions.deleteNotification(notification));
		const resp = yield API.deleteNotification(notificationId);
	} catch (error) {
		yield put(NotificationsActions.upsertNotification(notification));
		yield put(DialogActions.showErrorDialog('delete', 'notification', error.response));
	}
}

export function* sendDeleteAllNotifications() {
	const notifications = yield select(selectNotifications);

	try {
		yield put(NotificationsActions.setNotifications([]));
		const resp = yield API.deleteAllNotifications();
	} catch (error) {
		yield put(NotificationsActions.setNotifications(notifications));
		yield put(DialogActions.showErrorDialog('delete', 'notification', error.response));
	}
}

export function* confirmSendDeleteAllNotifications() {
	const config = {
		title: 'Delete All Notifications',
		templateType: DIALOG_TYPES.CONFIRM_DELETE_ALL_NOTIFICATIONS ,
		confirmText: 'Delete',
		onConfirm: NotificationsActions.sendDeleteAllNotifications
	};

	yield put(DialogActions.showDialog(config));
}

export default function* NotificationsSaga() {
	yield takeLatest(NotificationsTypes.SEND_GET_NOTIFICATIONS, sendGetNotifications);
	yield takeLatest(NotificationsTypes.SEND_UPDATE_NOTIFICATION_READ, sendUpdateNotificationRead);
	yield takeLatest(NotificationsTypes.SEND_DELETE_NOTIFICATION, sendDeleteNotification);
	yield takeLatest(NotificationsTypes.SEND_DELETE_ALL_NOTIFICATIONS, sendDeleteAllNotifications);
	yield takeLatest(NotificationsTypes.CONFIRM_SEND_DELETE_ALL_NOTIFICATIONS, confirmSendDeleteAllNotifications);
}
