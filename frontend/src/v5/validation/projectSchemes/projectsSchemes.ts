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

const project = trimmedString
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
	);

export const EditProjectSchema = Yup.object().shape({
	projectName: project
		.test(
			'alreadyExistingProject',
			formatMessage({
				id: 'projectForm.name.error.alreadyExisting',
				defaultMessage: 'This name is already taken',
			}),
			(projectName, { options }) => {
				const existingNames = options.context.existingNames || [];
				return !existingNames.includes(projectName);
			},
		),
});

export const CreateProjectSchema = Yup.object().shape({
	projectName: project
		.test(
			'alreadyExistingProject',
			formatMessage({
				id: 'projectForm.name.error.alreadyExisting',
				defaultMessage: 'This name is already taken',
			}),
			(projectName, { options }) => {
				const existingNames = options.context.existingProjects || [];
				return !existingNames.map((name) => name.trim()).includes(projectName);
			},
		),
});
