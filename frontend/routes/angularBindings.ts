/*
	This file contains react components conversion to angular context.
	It should be change to ReactRouter file if app is fully migrated
*/
import * as React from 'react';
import { react2angular as wrap } from 'react2angular';

// Routes
import Users from './users/users.container';
import DialogContainer from './components/dialogContainer/dialogContainer.container';
import Jobs from './jobs/jobs.container';
import Projects from './projects/projects.container';

angular
	.module('3drepo')
	.component('users', wrap(Users, ['users', 'jobs', 'active', 'limit']))
	.component('jobs', wrap(Jobs, ['active']))
	.component('dialogContainer', wrap(DialogContainer))
	.component('projects', wrap(Projects, ['projects', 'users']));
