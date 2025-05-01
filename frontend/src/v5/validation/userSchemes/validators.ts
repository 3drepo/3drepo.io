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
import { avatarFileIsTooBig, AVATAR_MAX_SIZE_MESSAGE } from '@/v5/store/currentUser/currentUser.helpers';
import { getMaxFileSizeMessage, trimmedString } from '../shared/validators';

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

export const avatarFile = Yup.mixed()
	.test(
		'fileSize',
		getMaxFileSizeMessage(AVATAR_MAX_SIZE_MESSAGE),
		(file) => !avatarFileIsTooBig(file),
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
	);