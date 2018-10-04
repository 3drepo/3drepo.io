/*
	This file contains react components conversion to angular context.
	It should be change to ReactRouter file if app is fully migrated
*/
import * as React from 'react';
import { react2angular as wrap } from 'react2angular';
import { BrowserRouter as Router } from 'react-router-dom';

// Routes
import DialogContainer from './components/dialogContainer/dialogContainer.container';
import UserManagement from './userManagement/userManagement.container';
import Profile from './profile/profile.container';

angular
	.module('3drepo')
	.component('dialogContainer', wrap(DialogContainer))
	.component('userManagement', wrap(UserManagement, ['projects', 'users']))
	.component('profile', wrap(Profile));
