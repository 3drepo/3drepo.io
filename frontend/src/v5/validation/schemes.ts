/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { formatMessage } from '@/v5/services/intl';
import { EMPTY_VIEW } from '@/v5/store/federations/federations.types';
import { getPasswordStrength } from '@/v4/services/validation';

const numberField = Yup.number().typeError(formatMessage({
	id: 'federations.surveyPoint.error.number',
	defaultMessage: 'Must be a decimal number or integer',
}));

export const FederationSettingsSchema = Yup.object().shape({
	name: Yup.string()
		.min(2,
			formatMessage({
				id: 'federations.name.error.min',
				defaultMessage: 'Federation Name must be at least 2 characters',
			}))
		.max(120,
			formatMessage({
				id: 'federations.name.error.max',
				defaultMessage: 'Federation Name is limited to 120 characters',
			}))
		.required(
			formatMessage({
				id: 'federations.name.error.required',
				defaultMessage: 'Federation Name is a required field',
			}),
		),
	desc: Yup.lazy((value) => (
		value === ''
			? Yup.string().strip()
			: Yup.string()
				.min(1,
					formatMessage({
						id: 'federations.desc.error.min',
						defaultMessage: 'Federation Description must be at least 1 character',
					}))
				.max(600,
					formatMessage({
						id: 'federations.desc.error.max',
						defaultMessage: 'Federation Description is limited to 600 characters',
					}))
	)),
	unit: Yup.string().required().default('mm'),
	code: Yup.lazy((value) => (
		value === ''
			? Yup.string().strip()
			: Yup.string()
				.min(1,
					formatMessage({
						id: 'federations.code.error.min',
						defaultMessage: 'Code must be at least 1 character',
					}))
				.max(50,
					formatMessage({
						id: 'federations.code.error.max',
						defaultMessage: 'Code is limited to 50 characters',
					}))
				.matches(/^[\w|_|-]*$/,
					formatMessage({
						id: 'federations.code.error.characters',
						defaultMessage: 'Code can only consist of letters and numbers',
					}))
	)),
	defaultView: Yup.string()
		.nullable()
		.transform((value) => (value === EMPTY_VIEW._id ? null : value)),
	latitude: numberField.required(),
	longitude: numberField.required(),
	angleFromNorth: numberField
		.min(0,
			formatMessage({
				id: 'federations.angle.error.min',
				defaultMessage: 'Angle cannot be smaller than 0',
			}))
		.max(360,
			formatMessage({
				id: 'federations.angle.error.max',
				defaultMessage: 'Angle cannot be greater than 360',
			}))
		.transform((value) => value ?? 0),
	x: numberField.required(),
	y: numberField.required(),
	z: numberField.required(),
});

export const UserSignupSchemaAccount = (usernameAlreadyExisting: string[] = []) => Yup.object().shape({
	username: Yup.string()
		.matches(/^[a-zA-Z][\w]{1,63}$/, formatMessage({
			id: 'user.username.error.characters',
			defaultMessage: 'Username can only consist of letters, numbers and underscores',
		}))
		.required(
			formatMessage({
				id: 'userSignupForm.username.error.required',
				defaultMessage: 'Username is required',
			}),
		)
		.min(2,
			formatMessage({
				id: 'userRegistration.username.error.min',
				defaultMessage: 'Username must be at least 2 characters',
			}))
		.max(120,
			formatMessage({
				id: 'userRegistration.username.error.max',
				defaultMessage: 'Username is limited to 120 characters',
			}))
		.test(
			'usernameAlreadyExisting',
			formatMessage({
				id: 'userRegistration.username.alreadyExisting',
				defaultMessage: 'This username is already taken',
			}),
			(username) => !usernameAlreadyExisting.includes(username),
		),
	email: Yup.string().email()
		.required(
			formatMessage({
				id: 'userRegistration.email.error.required',
				defaultMessage: 'Email is a required field',
			}),
		),
	password: Yup.string()
		.required(
			formatMessage({
				id: 'userRegistration.password.error.required',
				defaultMessage: 'Password is a required field',
			}),
		)
		.min(8,
			formatMessage({
				id: 'userRegistration.password.error.min',
				defaultMessage: 'Password must be at least 8 characters',
			}))
		.max(128,
			formatMessage({
				id: 'userRegistration.password.error.max',
				defaultMessage: 'Password is limited to 128 characters',
			}))
		.test(
			'checkPasswordStrength',
			'Password is too weak',
			async (password) => await getPasswordStrength(password) >= 2,
		),
	confirmPassword: Yup.string()
		.required(
			formatMessage({
				id: 'userRegistration.confirmPassword.error.required',
				defaultMessage: 'Confirm password is a required field',
			}),
		)
		.oneOf(
			[Yup.ref('password'), null],
			formatMessage({
				id: 'userRegistration.confirmPassword.error.notMatch',
				defaultMessage: 'Passwords must match',
			}),
		),
});

export const UserSignupSchemaPersonal = Yup.object().shape({
	firstname: Yup.string()
		.min(2, formatMessage({
			id: 'userRegistration.firstname.error.min',
			defaultMessage: 'First name must be at least 2 characters',
		}))
		.max(50, formatMessage({
			id: 'userRegistration.firstname.error.max',
			defaultMessage: 'First name is limited to 50 characters',
		}))
		.required(formatMessage({
			id: 'userRegistration.firstname.error.required',
			defaultMessage: 'First name is a required field',
		})),
	lastname: Yup.string()
		.min(2, formatMessage({
			id: 'userRegistration.lastname.error.min',
			defaultMessage: 'Last name must be at least 2 characters',
		}))
		.max(50, formatMessage({
			id: 'userRegistration.lastname.error.max',
			defaultMessage: 'Last name is limited to 50 characters',
		}))
		.required(formatMessage({
			id: 'userRegistration.lastname.error.required',
			defaultMessage: 'Last name is a required field',
		})),
	company: Yup.string()
		.required(
			formatMessage({
				id: 'userRegistration.company.required',
				defaultMessage: 'Company is a required field',
			}),
		),
	country: Yup.string()
		.required(
			formatMessage({
				id: 'userRegistration.country.error.required',
				defaultMessage: 'Country is a required field',
			}),
		),
});

export const UserSignupSchemaTermsAndSubmit = Yup.object().shape({
	terms: Yup.boolean().oneOf([true]),
});
