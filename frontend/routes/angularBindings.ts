/*
	This file contains react components conversion to angular context.
	It should be removed if app is fully migrated
*/
import * as React from 'react';
import { react2angular as wrap } from 'react2angular';

// Routes
import Users from './users/users.container';
import DialogContainer from './components/dialogContainer/dialogContainer.container';

angular
	.module('3drepo')

	.component('users', wrap(Users, ['users', 'jobs', 'onUsersChange', 'active', 'limit']))
	.component('dialogContainer', wrap(DialogContainer));
