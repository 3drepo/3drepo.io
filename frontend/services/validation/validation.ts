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
import { strength, differentThan, equalTo } from './customValidators';
import { getPasswordStrength } from './customValidators';

export const VALIDATIONS_MESSAGES = {
	REQUIRED: 'This field is required',
	TOO_SHORT_STRING: 'Must be at least ${min} characters',
	TOO_LONG_STRING: 'Must be at most ${max} characters',
	NOT_ALPHANUMERIC: 'Must use alphanumeric characters'
};

Yup.addMethod(Yup.string, 'differentThan', differentThan );
Yup.addMethod(Yup.string, 'equalTo', equalTo);
Yup.addMethod(Yup.string, 'strength', strength );

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
		.max(128, VALIDATIONS_MESSAGES.TOO_LONG_STRING),

	revisionName: Yup.string()
		.required(VALIDATIONS_MESSAGES.REQUIRED)
		.max(20, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
		.matches(/^[A-Za-z0-9]+$/, VALIDATIONS_MESSAGES.NOT_ALPHANUMERIC),

	required: Yup.string()
		.required(VALIDATIONS_MESSAGES.REQUIRED)
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
