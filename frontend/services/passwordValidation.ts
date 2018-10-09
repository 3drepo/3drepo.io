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
import * as Yup from 'yup';

const VALIDATIONS_MESSAGES = {
	REQUIRED: 'This field is required',
	TOO_SHORT_STRING: 'Must be at least ${min} characters',
	TOO_LONG_STRING: 'Must be at most ${max} characters'
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

// TODO: Should be changed to dynamic import if app is fully migrated
export const getPasswordStrength = (password) => loadPasswordLibrary().then((zxcvbn: any) => zxcvbn(password).score);

/*
	Custom validators
*/
function differentThan(ref: any, message: any) {
	return this.test({
		name: 'differentThan',
		exclusive: false,
		message: message || '${path} must be the different than ${reference}',
		params: {
			reference: ref.path
		},
		test(value: any) {
			return value !== this.resolve(ref);
		}
	});
}

function strength(requiredValue: any, message: any) {
	return this.test({
		name: 'strength',
		exclusive: false,
		message: message || '${path} is too weak',
		async test(value: any) {
			// TODO: Should be changed to dynamic import if app is fully migrated
			const result = await getPasswordStrength(value);
			return result > requiredValue;
		}
	});
}

Yup.addMethod(Yup.string, 'differentThan', differentThan);
Yup.addMethod(Yup.string, 'strength', strength);

/*
	Validation schemas
*/
export const schema = {
	firstName: Yup.string()
		.min(2, VALIDATIONS_MESSAGES.TOO_SHORT_STRING)
		.max(50, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
		.required(VALIDATIONS_MESSAGES.REQUIRED),

	lastName: Yup.string().ensure()
		.min(2, VALIDATIONS_MESSAGES.TOO_SHORT_STRING)
		.max(50, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
		.required(VALIDATIONS_MESSAGES.REQUIRED),

	email: Yup.string().ensure()
		.min(3, VALIDATIONS_MESSAGES.TOO_SHORT_STRING)
		.max(254, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
		.email('This email address is invalid')
		.required(VALIDATIONS_MESSAGES.REQUIRED),

	password: Yup.string()
		.required(VALIDATIONS_MESSAGES.REQUIRED)
		.ensure()
		.min(8, VALIDATIONS_MESSAGES.TOO_SHORT_STRING)
		.max(128, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
};

export const getPasswordStrengthMessage = (score: number) => {
	const scoreMapping = ['Very Weak', 'Weak', 'OK', 'Strong', 'Very Strong'];
	return score >= scoreMapping.length ? 'Very Strong' : scoreMapping[score];
};

export const evaluatePassword = (password: string) => new Promise((resolve) => {
	if (password.length < 8) {
		resolve({
			validPassword: false,
			comment: 'Must be at least 8 characters'
		});
	}

	getPasswordStrength(password).then((strengthValue) => {
		resolve({
			validPassword: strengthValue > 1,
			comment: getPasswordStrengthMessage(strengthValue),
			strength: strengthValue
		});
	});
});
