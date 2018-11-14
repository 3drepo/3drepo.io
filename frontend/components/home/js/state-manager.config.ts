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
		url: '/viewer/:teamspace/:modelId/:revision?issueId&riskId',
		template: `
			<model
				is-lite-mode="vm.isLiteMode"
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

	$stateProvider.state('app.dashboard', {
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
		template: '<login login-message="vm.loginMessage"/>',
		data: {
			isLogoutRequired: true
		},
		params: {
			referrer: { dynamic: true, value: null }
		}
	});

	$stateProvider.state('app.signUp', {
		url: '/sign-up',
		template: '<sign-up />',
		data: {
			isLogoutRequired: true
		}
	});

	$stateProvider.state('app.passwordForgot', {
		url: '/password-forgot',
		template: '<password-forgot />',
		data: {
			isLogoutRequired: true
		}
	});

	$stateProvider.state('app.passwordChange', {
		url: '/password-change?token&username',
		template: `
			<password-change
				token="vm.query.token"
				username="vm.query.username"
			/>
		`,
		data: {
			isLogoutRequired: true
		}
	});

	$stateProvider.state('app.registerRequest', {
		url: '/register-request',
		template: '<register-request />'
	});

	$stateProvider.state('app.registerVerify', {
		url: '/register-verify?token&username?pay',
		template: '<register-verify />',
		data: {
			isLogoutRequired: true
		}
	});

	// Static pages
	$stateProvider.state('app.static', {
		url: '',
		template: '<ui-view />'
	});

	$stateProvider.state('app.static.privacy', {
		url: '/privacy',
		template: '<privacy id="privacy" />'
	});

	$stateProvider.state('app.static.terms', {
		url: '/terms',
		template: '<terms id="terms" />'
	});

	$stateProvider.state('app.static.cookies', {
		url: '/cookies',
		template: '<cookies id="cookies" />'
	});

	$httpProvider.interceptors.push('AuthInterceptor');
	$urlRouterProvider.otherwise('/');
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
