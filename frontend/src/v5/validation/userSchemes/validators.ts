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
import { avatarFileIsTooBig } from '@/v5/store/currentUser/currentUser.helpers';
import { trimmedString } from '../shared/validators';

export const username = trimmedString
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
	.max(65,
		formatMessage({
			id: 'userRegistration.username.error.max',
			defaultMessage: 'Username is limited to 65 characters',
		}))
	.matches(/^[a-zA-Z][\w]{1,65}$/, formatMessage({
		id: 'user.username.error.characters',
		defaultMessage: 'Username can only consist of letters, numbers and underscores',
	}))
	.test(
		'alreadyExistingUsernames',
		formatMessage({
			id: 'userRegistration.username.alreadyExisting',
			defaultMessage: 'This username is already taken',
		}),
		(usernameValue, testContext) => (
			!testContext.options.context.alreadyExistingUsernames.map((u) => u.trim()).includes(usernameValue)
		),
	);

export const password = (passwordName = 'Password') => Yup.string()
	.required(
		formatMessage({
			id: 'validation.password.error.required',
			defaultMessage: '{passwordName} is a required field',
		}, { passwordName }),
	)
	.min(8,
		formatMessage({
			id: 'validation.password.error.min',
			defaultMessage: 'Password must be at least 8 characters',
		}))
	.max(65,
		formatMessage({
			id: 'validation.password.error.max',
			defaultMessage: 'Password is limited to 65 characters',
		}))
	.test(
		'checkPasswordStrength',
		formatMessage({
			id: 'validation.password.error.tooWeak',
			defaultMessage: 'Password is too weak',
		}),
		async (passwordValue) => await getPasswordStrength(passwordValue) >= 2,
	);

export const firstName = trimmedString
	.required(formatMessage({
		id: 'validation.firstName.error.required',
		defaultMessage: 'First name is a required field',
	}))
	.min(1, formatMessage({
		id: 'validation.firstName.error.min',
		defaultMessage: 'First name must be at least 1 characters',
	}))
	.max(35, formatMessage({
		id: 'validation.firstName.error.max',
		defaultMessage: 'First name is limited to 35 characters',
	}));

export const lastName = trimmedString
	.required(formatMessage({
		id: 'validation.lastName.error.required',
		defaultMessage: 'Last name is a required field',
	}))
	.min(1, formatMessage({
		id: 'validation.lastName.error.min',
		defaultMessage: 'Last name must be at least 1 characters',
	}))
	.max(35, formatMessage({
		id: 'validation.lastName.error.max',
		defaultMessage: 'Last name is limited to 35 characters',
	}));

export const company = trimmedString
	.max(120, formatMessage({
		id: 'validation.company.error.max',
		defaultMessage: 'Company is limited to 120 characters',
	}));

export const countryCode = Yup.string()
	.required(
		formatMessage({
			id: 'validation.countryCode.error.required',
			defaultMessage: 'Country is a required field',
		}),
	);

export const email = trimmedString
	.email(
		formatMessage({
			id: 'validation.email.error.invalid',
			defaultMessage: 'Invalid email address',
		}),
	)
	.max(254, formatMessage({
		id: 'validation.email.error.max',
		defaultMessage: 'Email is limited to 254 characters',
	}))
	.required(
		formatMessage({
			id: 'validation.email.error.required',
			defaultMessage: 'Email is a required field',
		}),
	)
	.test(
		'alreadyExistingEmails',
		formatMessage({
			id: 'validation.email.alreadyExisting',
			defaultMessage: 'This email is already taken',
		}),
		(emailValue, testContext) => (
			!testContext.options.context.alreadyExistingEmails.map((e) => e.trim()).includes(emailValue)
		),
	);

export const avatarFile = Yup.mixed()
	.test(
		'fileSize',
		formatMessage({
			id: 'validation.avatar.error.fileSize',
			defaultMessage: 'Image cannot exceed 1 MB.',
		}),
		(file) => !avatarFileIsTooBig(file),
	);
