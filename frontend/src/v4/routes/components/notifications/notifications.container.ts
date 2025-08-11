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

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import { RouterActions } from '@/v4/modules/router/router.redux';
import { selectCurrentUser } from '../../../modules/currentUser';
import { selectDrawerOpenState, selectHasNotificationsLastWeek,
	selectHasNotificationsThisWeek, selectHasNotificationsUntilLastWeekOnly, selectHasOlderNotifications,
	selectHasOnlyOlderNotifications, selectLastWeeksNotifications, selectNotifications,
	selectOlderNotifications, selectThisWeeksNotifications, selectUnreadCount,
	NotificationsActions } from '../../../modules/notifications';
import { Notifications } from './notifications.component';

const mapStateToProps = createStructuredSelector({
	notifications: selectNotifications,
	currentUser: selectCurrentUser,
	drawerOpened: selectDrawerOpenState,
	unreadCount: selectUnreadCount,
	thisWeeksNotifications: selectThisWeeksNotifications,
	lastWeeksNotifications: selectLastWeeksNotifications,
	olderNotifications: selectOlderNotifications,
	hasNotificationsThisWeek: selectHasNotificationsThisWeek,
	hasNotificationsLastWeek: selectHasNotificationsLastWeek,
	hasOlderNotifications: selectHasOlderNotifications,
	hasNotificationsUntilLastWeekOnly: selectHasNotificationsUntilLastWeekOnly,
	hasOnlyOlderNotifications: selectHasOnlyOlderNotifications
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	sendGetNotifications: NotificationsActions.sendGetNotifications,
	sendUpdateNotificationRead: NotificationsActions.sendUpdateNotificationRead,
	sendUpdateAllNotificationsRead: NotificationsActions.sendUpdateAllNotificationsRead,
	sendDeleteNotification: NotificationsActions.sendDeleteNotification,
	confirmSendDeleteAllNotifications: NotificationsActions.confirmSendDeleteAllNotifications,
	subscribeOnChanges: NotificationsActions.subscribeOnChanges,
	unsubscribeFromChanges: NotificationsActions.unsubscribeFromChanges,
	showUpdatedFailedError: NotificationsActions.showUpdatedFailedError,
	setDrawerPanelState: NotificationsActions.setDrawerPanelState,
	navigate: RouterActions.navigate
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Notifications as any);
