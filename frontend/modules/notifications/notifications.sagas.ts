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

import * as API from '../../services/api';
import {
	DeleteAllNotificationsDialog
} from '../../routes/components/deleteAllNotificationsDialog/deleteAllNotificationsDialog.component';
import { DialogActions } from '../dialog';
import { NotificationsTypes, NotificationsActions, selectNotifications } from './index';

const getNotificationById = (notifications, id) => {
	return notifications.find((n) => n._id === id );
};

export function* sendGetNotifications() {
	try {
		const { data } = yield API.getNotifications();
		yield put(NotificationsActions.setNotifications(data));
	} catch (e) {
		yield put(DialogActions.showEndpointErrorDialog('fetch', 'notifications', e));
	}
}

export function* sendUpdateNotificationRead({ notificationId, read }) {
	try {
		const notifications = yield select(selectNotifications);
		const notification = yield getNotificationById(notifications, notificationId);
		if (notification.read === read) {
			return;
		}

		yield put(NotificationsActions.patchNotification({_id: notificationId, read}));
		yield API.patchNotification(notificationId, {read});
	} catch (error) {
		yield put(NotificationsActions.patchNotification({_id: notificationId, read: !read}));
		yield put(DialogActions.showEndpointErrorDialog('update', 'notification', error));
	}
}

export function* sendDeleteNotification({ notificationId }) {
	const notifications = yield select(selectNotifications);
	const notification = yield getNotificationById(notifications, notificationId);
	if (!notification) {
		return;
	}

	try {
		yield put(NotificationsActions.deleteNotification(notification));
		yield API.deleteNotification(notificationId);
	} catch (error) {
		yield put(NotificationsActions.upsertNotification(notification));
		yield put(DialogActions.showEndpointErrorDialog('delete', 'notification', error));
	}
}

export function* sendDeleteAllNotifications() {
	const notifications = yield select(selectNotifications);

	try {
		yield put(NotificationsActions.setNotifications([]));
		yield API.deleteAllNotifications();
		yield put(NotificationsActions.setDrawerPanelState(false));
	} catch (error) {
		yield put(NotificationsActions.setNotifications(notifications));
		yield put(DialogActions.showEndpointErrorDialog('delete', 'notification', error));
	}
}

export function* confirmSendDeleteAllNotifications() {
	const config = {
		title: 'Delete All Notifications',
		template: DeleteAllNotificationsDialog ,
		onConfirm: NotificationsActions.sendDeleteAllNotifications
	};

	yield put(DialogActions.showDialog(config));
}

export function* showUpdatedFailedError({ errorMessage }) {
	yield put(DialogActions.showErrorDialog('update', 'model', errorMessage));
}

export default function* NotificationsSaga() {
	yield takeLatest(NotificationsTypes.SEND_GET_NOTIFICATIONS, sendGetNotifications);
	yield takeLatest(NotificationsTypes.SEND_UPDATE_NOTIFICATION_READ, sendUpdateNotificationRead);
	yield takeLatest(NotificationsTypes.SEND_DELETE_NOTIFICATION, sendDeleteNotification);
	yield takeLatest(NotificationsTypes.SEND_DELETE_ALL_NOTIFICATIONS, sendDeleteAllNotifications);
	yield takeLatest(NotificationsTypes.CONFIRM_SEND_DELETE_ALL_NOTIFICATIONS, confirmSendDeleteAllNotifications);
	yield takeLatest(NotificationsTypes.SHOW_UPDATED_FAILED_ERROR, showUpdatedFailedError);
}
