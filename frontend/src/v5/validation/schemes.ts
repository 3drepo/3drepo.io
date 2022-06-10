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
import { getPasswordStrength } from '@/v4/services/validation';
import { EMPTY_VIEW } from '@/v5/store/store.helpers';

const numberField = Yup.number().typeError(formatMessage({
	id: 'settings.surveyPoint.error.number',
	defaultMessage: 'Must be a decimal number or integer',
}));

const BaseSettingsSchema = Yup.object().shape({
	name: Yup.string()
		.min(2,
			formatMessage({
				id: 'settings.name.error.min',
				defaultMessage: 'Name must be at least 2 characters',
			}))
		.max(120,
			formatMessage({
				id: 'settings.name.error.max',
				defaultMessage: 'Name is limited to 120 characters',
			}))
		.required(
			formatMessage({
				id: 'settings.name.error.required',
				defaultMessage: 'Name is a required field',
			}),
		),
	desc: Yup.lazy((value) => (
		value === ''
			? Yup.string().strip()
			: Yup.string()
				.min(1,
					formatMessage({
						id: 'settings.desc.error.min',
						defaultMessage: 'Description must be at least 1 character',
					}))
				.max(600,
					formatMessage({
						id: 'settings.desc.error.max',
						defaultMessage: 'Description is limited to 600 characters',
					}))
	)),
	unit: Yup.string().required().default('mm'),
	code: Yup.lazy((value) => (
		value === ''
			? Yup.string().strip()
			: Yup.string()
				.min(1,
					formatMessage({
						id: 'settings.code.error.min',
						defaultMessage: 'Code must be at least 1 character',
					}))
				.max(50,
					formatMessage({
						id: 'settings.code.error.max',
						defaultMessage: 'Code is limited to 50 characters',
					}))
				.matches(/^[\w|_|-]*$/,
					formatMessage({
						id: 'settings.code.error.characters',
						defaultMessage: 'Code can only consist of letters and numbers',
					}))
	)),
});

const AdvancedSettingsSchema = BaseSettingsSchema.shape({
	defaultView: Yup.string()
		.nullable()
		.transform((value) => (value === EMPTY_VIEW._id ? null : value)),
	latitude: numberField.required().default(0),
	longitude: numberField.required().default(0),
	angleFromNorth: numberField
		.min(0,
			formatMessage({
				id: 'settings.angle.error.min',
				defaultMessage: 'Angle cannot be smaller than 0',
			}))
		.max(360,
			formatMessage({
				id: 'settings.angle.error.max',
				defaultMessage: 'Angle cannot be greater than 360',
			}))
		.transform((value) => value ?? 0),
	x: numberField.required().default(0),
	y: numberField.required().default(0),
	z: numberField.required().default(0),
});

export const UserSignupSchemaAccount = (
	alreadyExistingUsernames: string[] = [],
	alreadyExistingEmails: string[] = [],
) => Yup.object().shape({
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
			'alreadyExistingUsernames',
			formatMessage({
				id: 'userRegistration.username.alreadyExisting',
				defaultMessage: 'This username is already taken',
			}),
			(username) => !alreadyExistingUsernames.includes(username),
		),
	email: Yup.string().email()
		.required(
			formatMessage({
				id: 'userRegistration.email.error.required',
				defaultMessage: 'Email is a required field',
			}),
		)
		.test(
			'alreadyExistingEmails',
			formatMessage({
				id: 'userRegistration.email.alreadyExisting',
				defaultMessage: 'This email is already taken',
			}),
			(email) => !alreadyExistingEmails.includes(email),
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
				defaultMessage: 'Password confirmation doesn\'t match the password',
			}),
		),
});

export const UserSignupSchemaPersonal = Yup.object().shape({
	firstName: Yup.string()
		.min(2, formatMessage({
			id: 'userRegistration.firstName.error.min',
			defaultMessage: 'First name must be at least 2 characters',
		}))
		.max(50, formatMessage({
			id: 'userRegistration.firstName.error.max',
			defaultMessage: 'First name is limited to 50 characters',
		}))
		.required(formatMessage({
			id: 'userRegistration.firstName.error.required',
			defaultMessage: 'First name is a required field',
		})),
	lastName: Yup.string()
		.min(2, formatMessage({
			id: 'userRegistration.lastName.error.min',
			defaultMessage: 'Last name must be at least 2 characters',
		}))
		.max(50, formatMessage({
			id: 'userRegistration.lastName.error.max',
			defaultMessage: 'Last name is limited to 50 characters',
		}))
		.required(formatMessage({
			id: 'userRegistration.lastName.error.required',
			defaultMessage: 'Last name is a required field',
		})),
	countryCode: Yup.string()
		.required(
			formatMessage({
				id: 'userRegistration.countryCode.error.required',
				defaultMessage: 'Country is a required field',
			}),
		),
});

export const UserSignupSchemaTermsAndSubmit = Yup.object().shape({
	termsAgreed: Yup.boolean().oneOf([true]),
});

export const NewFederationSettingsSchema = BaseSettingsSchema;
export const FederationSettingsSchema = AdvancedSettingsSchema;
export const ContainerSettingsSchema = AdvancedSettingsSchema.shape({ type: Yup.string() });
