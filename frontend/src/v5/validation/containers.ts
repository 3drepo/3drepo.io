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
import { formatMessage } from '../services/intl';

const containerName = Yup.string()
	.min(2,
		formatMessage({
			id: 'containers.creation.name.error.min',
			defaultMessage: 'Container Name must be at least 2 characters',
		}))
	.max(120,
		formatMessage({
			id: 'containers.creation.name.error.max',
			defaultMessage: 'Container Name is limited to 120 characters',
		}))
	.required(
		formatMessage({
			id: 'containers.creation.name.error.required',
			defaultMessage: 'Container Name is a required field',
		}),
	);

const containerUnit = Yup.string().required().default('mm');
const containerType = Yup.string().required().default('Uncategorised');

const containerCode = Yup.string()
	.max(50,
		formatMessage({
			id: 'containers.creation.code.error.max',
			defaultMessage: 'Code is limited to 50 characters',
		}))
	.matches(/^[A-Za-z0-9]*$/,
		formatMessage({
			id: 'containers.creation.code.error.characters',
			defaultMessage: 'Code can only consist of letters and numbers',
		}));

const containerDesc = Yup.string()
	.max(50,
		formatMessage({
			id: 'containers.creation.description.error.max',
			defaultMessage: 'Container Description is limited to 50 characters',
		}));

const revisionTag = Yup.string()
	.min(2,
		formatMessage({
			id: 'validation.revision.tag.error.min',
			defaultMessage: 'Revision Name must be at least 2 characters',
		}))
	.max(120,
		formatMessage({
			id: 'validation.revision.tag.error.max',
			defaultMessage: 'Revision Name is limited to 120 characters',
		}))
	.required(
		formatMessage({
			id: 'validation.revision.tag.error.required',
			defaultMessage: 'Revision Name is a required field',
		}),
	);

const revisionDesc = Yup.string()
	.max(50,
		formatMessage({
			id: 'validation.revision.description.error.max',
			defaultMessage: 'Revision Description is limited to 50 characters',
		}));

export const CreateContainerSchema = Yup.object().shape({
	name: containerName,
	unit: containerUnit,
	type: containerType,
	code: containerCode,
	desc: containerDesc,
});

export const ListItemSchema = Yup.object().shape({
	revisionTag,
	containerName,
});

export const SidebarSchema = Yup.object().shape({
	containerUnit,
	containerType,
	containerCode,
	containerDesc,
	revisionDesc,
});

export const UploadsSchema = Yup.object().shape({
	uploads: Yup
		.array()
		.of(ListItemSchema.concat(SidebarSchema))
		.required()
		.min(1),
});
