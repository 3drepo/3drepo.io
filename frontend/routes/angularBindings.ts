/*
	This file contains react components conversion to angular context.
	It should be change to ReactRouter file if app is fully migrated
*/
import { react2angular as wrap } from 'react2angular';

// Routes
import App from './app/app.container';
import ModelSettings from './modelSettings/modelSettings.container';
import Login from './login/login.container';

// Components
import Dashboard from './dashboard/dashboard.container';
import TopMenu from './components/topMenu/topMenu.container';

angular
	.module('3drepo')
	.component('app', wrap(App))
	.component('dashboard', wrap(Dashboard))
	.component('topMenu', wrap(TopMenu, ['isLiteMode', 'logoUrl', 'onLiteModeChange', 'onLogoClick']))
	.component('modelSettings', wrap(ModelSettings))
	.component('login', wrap(Login, ['headlineText']));
