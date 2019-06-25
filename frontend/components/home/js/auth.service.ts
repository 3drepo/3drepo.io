/**
 *  Copyright (C) 2014 3D Repo Ltd
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
import { getState } from '../../../helpers/migration';
import { selectIsAuthenticated } from '../../../modules/auth';
import { selectCurrentUser } from '../../../modules/currentUser';

export class AuthService {
	public static $inject: string[] = [
		'$injector',
		'$q',
		'$interval',
		'$location',
		'$window',
		'$mdDialog',
		'$timeout',
		'$state'
	];

	public initialAuthPromise;

	private doNotLogout;
	private loggedOutStates;
	private username;
	private loggedIn;
	private state;
	private events;
	private initPromise;
	private loginRequestPromise;
	private isAuthenticated;

	constructor(
		private $injector,
		private $q,
		private $interval,
		private $location,
		private $window,
		private $mdDialog,
		private $timeout,
		private $state
	) {
		this.doNotLogout = [
			'/terms',
			'/privacy',
			'/signUp',
			'/passwordForgot',
			'/passwordChange',
			'/registerRequest',
			'/registerVerify'
		];

		this.loggedOutStates = [
			'app.login',
			'app.signUp',
			'app.passwordForgot',
			'app.registerRequest',
			'app.registerVerify',
			'app.passwordChange'
		];

		this.state = {};
		this.events = {
			USER_LOGGED_IN : 'USER_LOGGED_IN',
			USER_LOGGED_OUT : 'USER_LOGGED_OUT'
		};

		this.initialAuthPromise = this.$q.defer();
	}

	public isLoggedIn() {
		return selectIsAuthenticated(getState());
	}

	public getUsername() {
		return selectCurrentUser(getState()).username;
	}

	public hasPermission(requiredPerm, permissions) {
		return permissions.indexOf(requiredPerm) !== -1;
	}

	public loggedOutPage() {
		const state = this.$state.current.name;

		return this.loggedOutStates.some((page) => {
			return state.indexOf(page) !== -1;
		});
	}
}

export const AuthServiceModule = angular
	.module('3drepo')
	.service('AuthService', AuthService);
