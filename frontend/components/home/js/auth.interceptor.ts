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

export class AuthInterceptor {

	public static $inject: string[] = [
		"$injector",
	];

	private dialogOpen = false;

	constructor(
		private $injector: any,
	) {
	}

	public responseError(response) {

		const notLogin = response.data.place !== "GET /login";

		const unauthorized = response.status === 401 &&
							response.data.message === "You are not logged in";
		const sessionHasExpired = unauthorized && !this.dialogOpen && notLogin;

		if (sessionHasExpired) {
			this.sessionExpired();
		} else {
			throw response;
		}

	}

	public request(config) {
		return config;
	}

	public requestError(config) {
		return config;
	}

	public response(res) {
		return res;
	}

	public sessionExpired() {

		const DialogService = this.$injector.get("DialogService");
		const AuthService = this.$injector.get("AuthService");
		const ViewerService = this.$injector.get("ViewerService");

		DialogService.sessionExpired().then(() => {
			ViewerService.reset();
			AuthService.logoutSuccess();
		});

	}

}

export const AuthInterceptorModule = angular
	.module("3drepo")
	.service("AuthInterceptor", AuthInterceptor);
