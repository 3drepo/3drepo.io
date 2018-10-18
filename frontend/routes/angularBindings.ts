/*
	This file contains react components conversion to angular context.
	It should be change to ReactRouter file if app is fully migrated
*/
import { react2angular as wrap } from 'react2angular';

// Routes
import DialogContainer from './components/dialogContainer/dialogContainer.container';
import SnackbarContainer from './components/snackbarContainer/snackbarContainer.container';
import Dashboard from './dashboard/dashboard.container';

// Components
import { UserInfo } from "./components/userInfo/userInfo.component";
import ModelSettings from './modelSettings/modelSettings.container';

angular
	.module("3drepo")
	.component("dialogContainer", wrap(DialogContainer))
	.component("snackbarContainer", wrap(SnackbarContainer))
	.component("dashboard", wrap(Dashboard))
	.component("userInfo", wrap(
		UserInfo,
		["loading", "hasAvatar", "avatarUrl", "username", "firstName", "lastName", "email"]
	)).component('modelSettings', wrap(ModelSettings));
