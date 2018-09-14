/*
	This file contains react components conversion to angular context.
	It should be removed if app is fully migrated
*/
import * as React from 'react';
import { react2angular as wrap } from 'react2angular';

// Components
import { ReactButton } from './components/reactButton/reactButton.component';

// Routes
import ReactRoute from './reactRoute/reactRoute.container';
import Users from './users/users.container';
import DialogContainer from './components/dialogContainer/dialogContainer.container';

angular
	.module('3drepo')
	.component('reactButton', wrap(ReactButton))

	.component('users', wrap(Users, ['users', 'jobs', 'onUsersChange', 'active', 'limit']))
	.component('reactRoute', wrap(ReactRoute))
	.component('dialogContainer', wrap(DialogContainer));
