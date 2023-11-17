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
import { trimmedString } from '../shared/validators';
import { formatMessage } from '../../services/intl';
import { PROJECT_IMAGE_MAX_SIZE_MESSAGE, projectImageFileIsTooBig } from '@/v5/store/projects/projects.helpers';
import { isString } from 'lodash';

export const name = trimmedString
	.max(120, formatMessage({
		id: 'projectForm.name.error.max',
		defaultMessage: 'Project name is limited to 120 characters',
	}))
	.required(
		formatMessage({
			id: 'projectForm.name.error.required',
			defaultMessage: 'Project name is required',
		}),
	)
	.matches(
		/^[^/?=#+]{0,119}[^/?=#+ ]{1}$/,
		formatMessage({
			id: 'projectForm.name.error.illegalCharacters',
			defaultMessage: 'Project name cannot contain the following characters: / ? = # +',
		}),
	)
	.test(
		'alreadyExistingProject',
		formatMessage({
			id: 'projectForm.name.error.alreadyExisting',
			defaultMessage: 'This name is already taken',
		}),
		(name, { options }) => {
			const existingNames = options.context.existingNames || [];
			return !existingNames.map((name) => name.trim().toLocaleLowerCase()).includes(name.toLocaleLowerCase());
		},
	);

export const image = Yup.mixed()
	.test(
		'fileSize',
		formatMessage({
			id: 'validation.project.error.fileSize',
			defaultMessage: 'Image cannot exceed {value}.',
		}, { value: PROJECT_IMAGE_MAX_SIZE_MESSAGE }),
		(file) => {
			if (!file || isString(file)) return true;
			return !projectImageFileIsTooBig(file);
		},
	);
