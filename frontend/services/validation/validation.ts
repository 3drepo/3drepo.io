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
import { differentThan, equalTo, strength } from './customValidators';
import { getPasswordStrength } from './customValidators';

export const VALIDATIONS_MESSAGES = {
	REQUIRED: 'This field is required',
	// tslint:disable-next-line: no-invalid-template-strings
	TOO_SHORT_STRING: 'Must be at least ${min} characters',
	// tslint:disable-next-line: no-invalid-template-strings
	TOO_LONG_STRING: 'This field is limited to ${max} characters',
	NOT_ALPHANUMERIC: 'Must use alphanumeric characters',
	DECIMAL: 'Must be a decimal number or integer',
	INTEGER: 'Must be an integer',
	USERNAME_CHARS: 'Must use only letters, numbers or underscores',
	NOT_NUMBER: 'Must be a number',
	// tslint:disable-next-line: no-invalid-template-strings
	MUST_BE_GREATER: 'Must be greater than or equal to ${min}',
	// tslint:disable-next-line: no-invalid-template-strings
	MUST_BE_LOWER: 'Must be lower than or equal to ${max}'
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
		.max(50, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
		.matches(/^[A-Za-z0-9_]+$/, VALIDATIONS_MESSAGES.NOT_ALPHANUMERIC),

	username: Yup.string()
		.matches(/^[a-zA-Z][\w]{1,63}$/, VALIDATIONS_MESSAGES.USERNAME_CHARS)
		.required(VALIDATIONS_MESSAGES.REQUIRED),

	required: Yup.string()
		.required(VALIDATIONS_MESSAGES.REQUIRED),

	measureNumberDecimal: Yup.string().matches(/^([+-]?([0-9]*[.])?[0-9]+)$/, VALIDATIONS_MESSAGES.DECIMAL),
	measureNumberIntegers: Yup.string().matches(/^[+-]?([0-9]*)$/, VALIDATIONS_MESSAGES.INTEGER),

	number: (min, max) => Yup.number()
		.typeError(VALIDATIONS_MESSAGES.DECIMAL)
		.required(VALIDATIONS_MESSAGES.REQUIRED)
		.min(min, VALIDATIONS_MESSAGES.MUST_BE_GREATER)
		.max(max, VALIDATIONS_MESSAGES.MUST_BE_LOWER),

	integer: (min, max) => Yup.number().typeError(VALIDATIONS_MESSAGES.INTEGER)
		.integer(VALIDATIONS_MESSAGES.INTEGER)
		.required(VALIDATIONS_MESSAGES.REQUIRED)
		.min(min, VALIDATIONS_MESSAGES.MUST_BE_GREATER)
		.max(max, VALIDATIONS_MESSAGES.MUST_BE_LOWER)
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
