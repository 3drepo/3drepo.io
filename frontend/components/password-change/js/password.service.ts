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

	private loaded: boolean;

	constructor(
		private $q,
		private APIService
	) {
		this.loaded = false;
	}

	public passwordLibraryAvailable() {
		if (!this.loaded) {
			this.addPasswordStrengthLib();
			this.loaded = true;
		}
		return window.zxcvbn !== undefined;
	}

	public evaluatePassword(password: string) {
		let strengthVal = 4;
		let strengthMsg = "OK";
		if (password.length < 8) {
			strengthVal = 0;
			strengthMsg = "Must be at least 8 characters";
		} else if (this.passwordLibraryAvailable()) {
			strengthVal = window.zxcvbn(password).score;
			strengthMsg = this.getPasswordEvalMessage(strengthVal);
		}
		return { validPassword: strengthVal > 1, comment: strengthMsg };
	}

	private addPasswordStrengthLib() {
		const ZXCVBN_SRC = "/dist/zxcvbn.js";
		const script = document.createElement("script");
		script.src = ZXCVBN_SRC;
		script.type = "text/javascript";
		script.async = true;
		const first = document.getElementsByTagName("script")[0];
		document.body.appendChild(script);
	}

	private getPasswordEvalMessage(score: number) {
		const scoreMapping = ["Very Weak", "Weak", "OK", "Strong", "Very Strong"];
		return score >= scoreMapping.length ? "Very Strong" : scoreMapping[score];
	}

}

export const PasswordServiceModule = angular
	.module("3drepo")
	.service("PasswordService", PasswordService);
