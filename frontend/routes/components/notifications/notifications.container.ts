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

import { connect } from '../../../helpers/migration';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import { Notifications } from './notifications.component';
import { NotificationsActions, selectNotifications, selectDrawerOpenState  } from '../../../modules/notifications';
import { selectCurrentUser } from '../../../modules/currentUser';
import { withRouter } from 'react-router';

const mapStateToProps = createStructuredSelector({
	notifications: selectNotifications,
	currentUser: selectCurrentUser,
	drawerOpened: selectDrawerOpenState
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
	sendGetNotifications: NotificationsActions.sendGetNotifications,
	sendUpdateNotificationRead: NotificationsActions.sendUpdateNotificationRead,
	sendDeleteNotification: NotificationsActions.sendDeleteNotification,
	confirmSendDeleteAllNotifications: NotificationsActions.confirmSendDeleteAllNotifications,
	upsertNotification: NotificationsActions.upsertNotification,
	deleteNotification: NotificationsActions.deleteNotification,
	showUpdatedFailedError: NotificationsActions.showUpdatedFailedError,
	setDrawerPanelState: NotificationsActions.setDrawerPanelState
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Notifications));
