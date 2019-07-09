import { selectIsAuthenticated } from '../../../modules/auth';
import { getState, history } from '../../../helpers/migration';
import { STATIC_ROUTES_PATHS } from '../../../services/staticPages';
/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function StateManagerConfig($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
	$locationProvider.html5Mode(true);

	$stateProvider.state('app', {
		url: '',
		abstract: true,
		views: {
			'main@': {
				template: '<home flex layout=\'column\'></home>'
			}
		}
	});

	$stateProvider.state('app.homepage', {
		url: '/'
	});

	$stateProvider.state('app.viewer', {
		url: '/viewer/:teamspace/:modelId/:revision?issueId&riskId&notificationId',
		template: `
			<model
				account="vm.$state.params.teamspace"
				model="vm.$state.params.modelId"
				branch="vm.$state.params.branch"
				revision="vm.$state.params.revision"
				issue-id="vm.$state.params.issueId"
				risk-id="vm.$state.params.riskId"
				state="vm.state"
			/>
		`,
		data: {
			isLoginRequired: true
		},
		params: {
			modelId: { squash: true, value: null },
			revision: { squash: true, value: null }
		}
	});

	/* $stateProvider.state('app.dashboard', {
		url: '/dashboard',
		template: '<dashboard flex/>',
		data: {
			isLoginRequired: true
		}
	});

	$stateProvider.state('app.dashboard.pages', {
		url: '/*page?project&view',
		data: {
			isLoginRequired: true
		}
	});

	$stateProvider.state('app.login', {
		url: '/login',
		template: '<login headline-text="vm.loginMessage" />',
		params: {
			referrer: { dynamic: true, value: null }
		}
	});

	$stateProvider.state('app.signUp', {
		url: '/sign-up',
		template: '<sign-up />'
	});

	$stateProvider.state('app.passwordForgot', {
		url: '/password-forgot',
		template: '<password-forgot />'
	});

	$stateProvider.state('app.passwordChange', {
		url: '/password-change?token&username',
		template: '<password-change />'
	});

	$stateProvider.state('app.registerRequest', {
		url: '/register-request',
		template: '<register-request />'
	});

	$stateProvider.state('app.registerVerify', {
		url: '/register-verify?token&username?pay',
		template: '<register-verify />'
	});

	$stateProvider.state('app.static', {
		url: `/{path:${STATIC_ROUTES_PATHS.map((path) => path.replace('/', '')).join('|')}}`,
		template: '<static-page-viewer />'
	}); */

	$httpProvider.interceptors.push('AuthInterceptor');

	$urlRouterProvider.otherwise(($injector) => {
		const AuthService = $injector.get('AuthService');
		const isAuthenticated = selectIsAuthenticated(getState());

/* 		if (!isAuthenticated) {
			const initialAuthPromise = isAuthenticated === null
				? AuthService.initialAuthPromise.promise
				: Promise.reject();

 			initialAuthPromise.catch(() => {
				history.push('/login');
			});
		} else {
			history.push('/dashboard/teamspaces');
		} */
	});
}

export const StateManagerConfigModule = angular
	.module('3drepo')
	.config([
		'$stateProvider',
		'$urlRouterProvider',
		'$locationProvider',
		'$httpProvider',
		StateManagerConfig
	]);
