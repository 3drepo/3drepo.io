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

import { createActions, createReducer } from 'reduxsauce';

export const { Types: NotificationsTypes, Creators: NotificationsActions } = createActions({
	sendGetNotifications: [],
	sendDeleteAllNotifications: [],
	confirmSendDeleteAllNotifications: [],
	sendUpdateNotificationRead: ['notificationId', 'read'],
	sendDeleteNotification: ['notificationId'],
	setNotifications: ['notifications'],
	upsertNotification: ['notification'],
	deleteNotification: ['notification'],
	patchNotification: ['notificationPatch']
}, { prefix: 'NOTIFICATIONS_' });

export const INITIAL_STATE = [];

export const setNotifications = (state = INITIAL_STATE, { notifications }) =>  (notifications) ;

const sortByTimeStamp = (notifications) => notifications.sort((a, b) => b.timestamp - a.timestamp);

export const upsertNotification = (state = INITIAL_STATE, { notification }) =>  {
	const index = state.findIndex((n) => n._id === notification._id);
	const newState = state.concat([]);
	newState.splice(index, (index >= 0 ? 1 : 0), notification);
	return sortByTimeStamp(newState);
};

export const deleteNotification = (state = INITIAL_STATE, { notification }) =>  {
	return state.filter((n) => n._id !== notification._id);
};

export const patchNotification = (state = INITIAL_STATE, { notificationPatch }) =>  {
	const _id = notificationPatch._id;
	return sortByTimeStamp(state.map((n) => n._id === _id ?  Object.assign(n, notificationPatch) : n ));
};

export const reducer = createReducer(INITIAL_STATE, {
	[NotificationsTypes.SET_NOTIFICATIONS]: setNotifications,
	[NotificationsTypes.UPSERT_NOTIFICATION]: upsertNotification,
	[NotificationsTypes.DELETE_NOTIFICATION]: deleteNotification,
	[NotificationsTypes.PATCH_NOTIFICATION]: patchNotification
});
