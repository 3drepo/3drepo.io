/**
 *  Copyright (C) 2017 3D Repo Ltd
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

export class PasswordService {

	public static $inject: string[] = [
		"$q",
		"APIService"
	];

	public accountDefer;
	public passwordMessage;

	constructor(
		private $q,
		private APIService
	) {
		this.accountDefer = $q.defer();
	}

	public checkDuplicates(password, confirmPassword) {
		const passwordValid = password === confirmPassword;
		this.passwordMessage = passwordValid ? "" : "(Password mismatched)";
		return this.passwordMessage;
	}

	public passwordLibraryAvailable() {
		return window.zxcvbn !== undefined;
	}

	public evaluatePassword(password: string) {
		let strengthVal = 4;
		if (password.length < 8) {
			strengthVal = 0;
		} else if (this.passwordLibraryAvailable()) {
			strengthVal = window.zxcvbn(password).score;
		}
		return { score: strengthVal };
	}

	public getPasswordStrength(password: string, score: number) {
		if (password.length < 8) {
			return "Must be at least 8 characters";
		}
		switch (score) {
			case 0:
				return "Very Weak";
			case 1:
				return "Weak";
			case 2:
				return "OK";
			case 3:
				return "Strong";
			case 4:
				return "Very Strong";
		}
		return "Very Weak";
	}

	public addPasswordStrengthLib() {
		if (this.passwordLibraryAvailable()) {
			return;
		}
		const ZXCVBN_SRC = "/dist/zxcvbn.js";
		const script = document.createElement("script");
		script.src = ZXCVBN_SRC;
		script.type = "text/javascript";
		script.async = true;
		const first = document.getElementsByTagName("script")[0];
		document.body.appendChild(script);
	}

}

export const PasswordServiceModule = angular
	.module("3drepo")
	.service("PasswordService", PasswordService);
