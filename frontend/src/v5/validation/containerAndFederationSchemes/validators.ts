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

export const numberField = Yup.number().typeError(formatMessage({
	id: 'settings.surveyPoint.error.number',
	defaultMessage: 'Must be a decimal number or integer',
}));

export const containerName = Yup.string()
	.max(120,
		formatMessage({
			id: 'validation.containers.name.error.max',
			defaultMessage: 'Container Name is limited to 120 characters',
		}))
	.required(
		formatMessage({
			id: 'validation.containers.name.error.required',
			defaultMessage: 'Container Name is a required field',
		}),
	);

export const containerUnit = Yup.string().required().oneOf(['mm', 'cm', 'dm', 'm', 'ft']).default('mm');
export const containerType = Yup.string().required().default('Uncategorised');

export const containerCode = Yup.string()
	.max(50,
		formatMessage({
			id: 'validation.containers.code.error.max',
			defaultMessage: 'Code is limited to 50 characters',
		}))
	.matches(/^[\w|_|-]*$/,
		formatMessage({
			id: 'validation.containers.code.error.characters',
			defaultMessage: 'Code can only consist of letters, numbers, hyphens or underscores',
		}));

export const containerDesc = Yup.string()
	.max(660,
		formatMessage({
			id: 'validation.containers.description.error.max',
			defaultMessage: 'Container Description is limited to 50 characters',
		}));

export const revisionTag = Yup.string()
	.max(50,
		formatMessage({
			id: 'validation.revisions.tag.error.error.max',
			defaultMessage: 'Revision Name is limited to 50 characters',
		}))
	.matches(/^[\w|_|-]*$/,
		formatMessage({
			id: 'validation.revisions.tag.error.characters',
			defaultMessage: 'Revision Name can only consist of letters, numbers, hyphens or underscores',
		}))
	.required(
		formatMessage({
			id: 'validation.revisions.tag.error.required',
			defaultMessage: 'Revision Name is a required field',
		}),
	);

export const revisionDesc = Yup.string()
	.max(660,
		formatMessage({
			id: 'validation.revisions.desc.error.max',
			defaultMessage: 'Revision Description is limited to 50 characters',
		}));
