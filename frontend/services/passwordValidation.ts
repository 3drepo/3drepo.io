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

const getPasswordEvalMessage = (score: number) => {
	const scoreMapping = ['Very Weak', 'Weak', 'OK', 'Strong', 'Very Strong'];
	return score >= scoreMapping.length ? 'Very Strong' : scoreMapping[score];
};

const loadPasswordLibrary = () => new Promise((resolve) => {
	if (!window.zxcvbn) {
		const ZXCVBN_SRC = "/dist/zxcvbn.js";
		const script = document.createElement("script");
		script.src = ZXCVBN_SRC;
		script.type = "text/javascript";
		script.async = true;
		const first = document.getElementsByTagName("script")[0];
		document.body.appendChild(script);
		script.onload = () => resolve(window.zxcvbn);
	} else {
		resolve(window.zxcvbn);
	}
});

export const evaluatePassword = (password: string) => new Promise((resolve) => {
	if (password.length < 8) {
		resolve({
			validPassword: false,
			comment: 'Must be at least 8 characters'
		});
	}

	// TODO: Should be changed to dynamic import if app is fully migrated
	loadPasswordLibrary().then((zxcvbn: any) => {
		const strength = zxcvbn(password).score;
		resolve({
			validPassword: zxcvbn(password).score > 1,
			comment: getPasswordEvalMessage(strength)
		});
	});
});
