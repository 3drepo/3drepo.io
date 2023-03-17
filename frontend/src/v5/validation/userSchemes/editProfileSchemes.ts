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
import { firstName, lastName, email, company, countryCode, password, avatarFile } from './validators';

export const EditProfileUpdatePersonalSchema = Yup.object().shape({
	firstName,
	lastName,
	email,
	company,
	countryCode,
});

export const EditProfileUpdatePasswordSchema = (incorrectPassword) => Yup.object().shape({
	oldPassword: Yup.string()
		.min(1,
			formatMessage({
				id: 'editProfile.password.error.empty',
				defaultMessage: 'Current password is a required field',
			}))
		.test(
			'incorrectPassword',
			formatMessage({
				id: 'editProfile.password.error.incorrectPassword',
				defaultMessage: 'Your existing password was incorrect. Please try again',
			}),
			() => !incorrectPassword,
		),
	newPassword: password('New Password')
		.test(
			'newPasswordIsDifferent',
			formatMessage({
				id: 'editProfile.password.error.samePassword',
				defaultMessage: 'New password must be different from the old one',
			}),
			(value, testContext) => value !== testContext.parent.oldPassword,
		),
	confirmPassword: Yup.string()
		.required(
			formatMessage({
				id: 'editProfile.confirmPassword.error.required',
				defaultMessage: 'Confirm password is a required field',
			}),
		)
		.test(
			'passwordMatch',
			formatMessage({
				id: 'editProfile.confirmPassword.error.notMatch',
				defaultMessage: 'Password confirmation doesn\'t match the password',
			}),
			(value, testContext) => value === testContext.parent.newPassword,
		),
});

export const EditProfileUpdateSSOPasswordSchema = Yup.object().shape({
	newPassword: password('New Password'),
	confirmPassword: Yup.string()
		.required(
			formatMessage({
				id: 'editProfile.confirmPassword.error.required',
				defaultMessage: 'Confirm password is a required field',
			}),
		)
		.test(
			'passwordMatch',
			formatMessage({
				id: 'editProfile.confirmPassword.error.notMatch',
				defaultMessage: 'Password confirmation doesn\'t match the password',
			}),
			(value, testContext) => value === testContext.parent.newPassword,
		),
});
