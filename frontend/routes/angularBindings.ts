/*
	This file contains react components conversion to angular context.
	It should be change to ReactRouter file if app is fully migrated
*/
import * as React from 'react';
import { react2angular as wrap } from 'react2angular';

// Routes
import DialogContainer from './components/dialogContainer/dialogContainer.container';
import SnackbarContainer from './components/snackbarContainer/snackbarContainer.container';
import Billing from './billing/billing.container';

import UserManagement from './userManagement/userManagement.container';
import Profile from './profile/profile.container';
import Teamspaces from './teamspaces/teamspaces.container';
import Notifications from './notifications/notifications.container';

angular
	.module('3drepo')
	.component('dialogContainer', wrap(DialogContainer))
	.component('snackbarContainer', wrap(SnackbarContainer))
	.component('userManagement', wrap(UserManagement, ['projects', 'users']))
	.component('profile', wrap(Profile))
	.component('billing', wrap(Billing))
	.component('teamspaces', wrap(Teamspaces))
	.component('notifications', wrap(Notifications, ['location', 'stateManager', 'chatService', 'userAccount']));
