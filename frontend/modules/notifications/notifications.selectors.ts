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
import { createSelector } from 'reselect';
import { getSunday, groupByTeamSpace } from '../../helpers/notifications';

export const selectNotificationsDomain = (state) => ({...state.notifications});

export const selectNotifications = createSelector(
	selectNotificationsDomain, (state) => state.notifications || []
);

export const selectUnreadCount = createSelector(
	selectNotifications, (notifications) => notifications.filter((n) => !n.read).length
);

const selectUngroupedThisWeeksNotifications = createSelector(
	selectNotifications, (notifications) => {
		const lastSunday = getSunday().getTime();
		return notifications.filter((n) => n.timestamp > lastSunday);
	}
);

const selectUngroupedLastWeeksNotifications = createSelector(
	selectNotifications, (notifications) => {
		const lastSunday = getSunday().getTime();
		const prevSunday = getSunday(-1).getTime();
		return notifications.filter((n) => n.timestamp > prevSunday && n.timestamp < lastSunday );
	}
);

const selectUngroupedOlderNotifications = createSelector(
	selectNotifications, (notifications) => {
		const prevSunday = getSunday(-1).getTime();
		return notifications.filter((n) => n.timestamp < prevSunday );
	}
);

export const selectThisWeeksNotifications = createSelector(
	selectUngroupedThisWeeksNotifications, groupByTeamSpace
);

export const selectLastWeeksNotifications = createSelector(
	selectUngroupedLastWeeksNotifications, groupByTeamSpace
);

export const selectOlderNotifications = createSelector(
	selectUngroupedOlderNotifications, groupByTeamSpace
);

export const selectHasNotificationsThisWeek = createSelector(
	selectUngroupedThisWeeksNotifications, (notifications) => notifications.length > 0
);

export const selectHasNotificationsLastWeek = createSelector(
	selectUngroupedLastWeeksNotifications, (notifications) => notifications.length > 0
);

export const selectHasOlderNotifications = createSelector(
	selectUngroupedOlderNotifications, (notifications) => notifications.length > 0
);

export const selectHasNotificationsUntilLastWeekOnly = createSelector(
	selectHasNotificationsThisWeek, selectUngroupedLastWeeksNotifications,
		(hasThisWeeks,  lastWeeksNotifications) => !hasThisWeeks && lastWeeksNotifications.length > 0
);

export const selectHasOnlyOlderNotifications = createSelector(
	selectHasNotificationsThisWeek, selectUngroupedLastWeeksNotifications,
		(hasThisWeeks,  lastWeeksNotifications) => !hasThisWeeks && lastWeeksNotifications.length === 0
);

export const selectDrawerOpenState = createSelector(
	selectNotificationsDomain, (state) => state.drawerOpened
);
