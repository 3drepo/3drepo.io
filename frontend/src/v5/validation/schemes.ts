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

const SettingsSchema = Yup.object().shape({
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
	defaultView: Yup.string()
		.nullable()
		.transform((value) => (value === EMPTY_VIEW._id ? null : value)),
	latitude: numberField.required(),
	longitude: numberField.required(),
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
	x: numberField.required(),
	y: numberField.required(),
	z: numberField.required(),
});

export const EditProfileUpdatePasswordSchema = Yup.object().shape({
	currentPassword: Yup.string()
		.when('$passwordWasIncorrect', (passwordWasIncorrect, schema) => (
			passwordWasIncorrect
				? schema.min(1,
					formatMessage({
						id: 'editProfile.password.error.incorrectPassword',
						defaultMessage: 'Your existing password was incorrect. Please try again',
					}))
				: schema.min(1,
					formatMessage({
						id: 'federations.password.error.empty',
						defaultMessage: 'Current password is a required field',
					}))
		)),
	newPassword: Yup.string()
		.required(
			formatMessage({
				id: 'editProfile.password.error.required',
				defaultMessage: 'Password is a required field',
			}),
		)
		.min(8,
			formatMessage({
				id: 'editProfile.password.error.min',
				defaultMessage: 'Password must be at least 8 characters',
			}))
		.max(128,
			formatMessage({
				id: 'editProfile.password.error.max',
				defaultMessage: 'Password is limited to 128 characters',
			}))
		.differentThan(
			Yup.ref('currentPassword'),
			formatMessage({
				id: 'editProfile.password.error.max',
				defaultMessage: 'New password should be different than old password',
			}),
		)
		.test(
			'checkPasswordStrength',
			formatMessage({
				id: 'editProfile.password.error.tooWeak',
				defaultMessage: 'Password is too weak',
			}),
			async (password) => await getPasswordStrength(password) >= 2,
		),
	confirmPassword: Yup.string()
		.required(
			formatMessage({
				id: 'editProfile.confirmPassword.error.required',
				defaultMessage: 'Confirm password is a required field',
			}),
		)
		.oneOf(
			[Yup.ref('newPassword'), null],
			formatMessage({
				id: 'editProfile.confirmPassword.error.notMatch',
				defaultMessage: 'Password confirmation doesn\'t match the password',
			}),
		),
});

export const EditProfileUpdatePersonalSchema = (alreadyExistingEmails: string[] = []) => Yup.object().shape({
	firstName: Yup.string()
		.min(2, formatMessage({
			id: 'editProfile.firstName.error.min',
			defaultMessage: 'First name must be at least 2 characters',
		}))
		.max(50, formatMessage({
			id: 'editProfile.firstName.error.max',
			defaultMessage: 'First name is limited to 50 characters',
		}))
		.required(formatMessage({
			id: 'editProfile.firstName.error.required',
			defaultMessage: 'First name is a required field',
		})),
	lastName: Yup.string()
		.min(2, formatMessage({
			id: 'editProfile.lastName.error.min',
			defaultMessage: 'Last name must be at least 2 characters',
		}))
		.max(50, formatMessage({
			id: 'editProfile.lastName.error.max',
			defaultMessage: 'Last name is limited to 50 characters',
		}))
		.required(formatMessage({
			id: 'editProfile.lastName.error.required',
			defaultMessage: 'Last name is a required field',
		})),
	email: Yup.string().email()
		.required(
			formatMessage({
				id: 'editProfile.email.error.required',
				defaultMessage: 'Email is a required field',
			}),
		)
		.test(
			'alreadyExistingEmails',
			formatMessage({
				id: 'editProfile.email.alreadyExisting',
				defaultMessage: 'This email is already taken',
			}),
			(email) => !alreadyExistingEmails.includes(email),
		),
	company: Yup.string()
		.required(
			formatMessage({
				id: 'editProfile.company.required',
				defaultMessage: 'Company is a required field',
			}),
		),
	countryCode: Yup.string()
		.required(
			formatMessage({
				id: 'editProfile.countryCode.error.required',
				defaultMessage: 'Country is a required field',
			}),
		),
});
export const FederationSettingsSchema = SettingsSchema;
export const ContainerSettingsSchema = SettingsSchema.shape({ type: Yup.string() });
