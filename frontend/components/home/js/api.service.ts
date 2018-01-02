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

export class APIService {

	public static $inject: string[] = [
		"$http",
		"ClientConfigService",
	];

	constructor(
		private $http: any,
		private ClientConfigService: any,
	) {
	}

	public getResponseCode(errorToFind) {
		return Object.keys(this.ClientConfigService.responseCodes).indexOf(errorToFind);
	}

	public getErrorMessage(resData: any): string {

		const messages = {
			FILE_FORMAT_NOT_SUPPORTED: "Unsupported file format",
			SIZE_LIMIT_PAY: "Insufficient quota for model",
			USER_NOT_VERIFIED: "Please click on the link in the verify email sent to your account",
			ALREADY_VERIFIED: "You have already verified your account successfully. You may now login to your account.",
			INVALID_CAPTCHA_RES: "Please prove you're not a robot",
			USER_EXISTS: "User already exists",
		};

		let message;

		Object.keys(this.ClientConfigService.responseCodes).forEach((key) => {
			if (this.ClientConfigService.responseCodes[key].value === resData.value) {
				if (messages[key]) {
					message = messages[key];
				} else {
					message = this.ClientConfigService.responseCodes[key].message;
				}
			}
		});

		return message;

	}

	public getAPIUrl(url: string) {
		return this.ClientConfigService.apiUrl(this.ClientConfigService.GET_API, url);
	}

	/**
	 * Handle GET requests
	 *
	 * @param url
	 * @returns {*|promise}
	 */
	public get(url: string) {

		this.checkUrl(url);
		url = encodeURI(url);
		const urlUse = this.ClientConfigService.apiUrl(
			this.ClientConfigService.GET_API,
			url,
		);
		const config = {
			withCredentials: true,
		};

		const request = this.$http.get(urlUse, config);
		// const response = AuthService.handleSessionExpiration(request);

		return request;

	}

	/**
	 * Handle POST requests
	 * @param url
	 * @param data
	 * @param headers
	 * @returns {*}
	 */
	public post(url: string, data: any, headers: any) {

		this.checkUrl(url);
		url = encodeURI(url);

		const urlUse = this.ClientConfigService.apiUrl(
			this.ClientConfigService.POST_API,
			url,
		);
		const config: any = {
			withCredentials: true,
		};

		if (headers) {
			config.headers = headers;
		}

		const request = this.$http.post(urlUse, data, config);

		return request;

	}

	/**
	 * Handle PUT requests
	 * @param url
	 * @param data
	 * @returns {*}
	 */
	public put(url: string, data: any) {

		this.checkUrl(url);
		url = encodeURI(url);

		const urlUse = this.ClientConfigService.apiUrl(
			this.ClientConfigService.POST_API,
			url,
		);
		const config = {withCredentials: true};

		const request = this.$http.put(urlUse, data, config);

		return request;

	}

	/**
	 * Handle DELETE requests
	 * @param url
	 * @param data
	 * @returns {*}
	 */
	public del(url: string, data: any) {

		this.checkUrl(url);

		url = encodeURI(url);
		url = this.ClientConfigService.apiUrl(
			this.ClientConfigService.POST_API,
			url,
		);

		const config = {
			data,
			withCredentials: true,
			headers: {
				"Content-Type": "application/json",
			},
		};

		const request = this.$http.delete(url, config);
		return request;
	}

	public checkUrl(url: string) {
		if (typeof url !== "string") {
			throw new Error("URL is not a string");
		} else if (url.length === 0) {
			throw new Error("Empty URL provided");
		}
	}

}

export const APIServiceModule = angular
	.module("3drepo")
	.service("APIService", APIService);
