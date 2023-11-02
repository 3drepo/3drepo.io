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
import filesize from 'filesize';
import { trimmedString } from '../shared/validators';
import { getState } from '@/v4/modules/store';
import { selectRevisions, selectRevisionsPending } from '@/v5/store/revisions/revisions.selectors';
import { RevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers';

const stripIfBlankString = (value) => (
	value === ''
		? Yup.string().strip()
		: Yup.string());

export const numberField = Yup.number()
	.default(0)
	.typeError(formatMessage({
		id: 'settings.surveyPoint.error.number',
		defaultMessage: 'Must be a number',
	}));

export const nullableNumberField = Yup.number()
	.transform((value) => (Number.isNaN(value) ? 0 : value))
	.nullable();

export const name = trimmedString
	.max(120,
		formatMessage({
			id: 'validation.model.name.error.max',
			defaultMessage: 'Name is limited to 120 characters',
		}))
	.required(
		formatMessage({
			id: 'validation.model.name.error.required',
			defaultMessage: 'Name is a required field',
		}),
	)
	.test(
		'alreadyExistingNames',
		formatMessage({
			id: 'validation.model.name.alreadyExisting',
			defaultMessage: 'This name is already used within this project',
		}),
		(nameValue, testContext) => {
			return !testContext.options.context.alreadyExistingNames.map((n) => n.trim().toLocaleLowerCase()).includes(nameValue?.toLocaleLowerCase());
		},
	);

export const unit = Yup.string().required().oneOf(['mm', 'cm', 'dm', 'm', 'ft']).default('mm');
export const type = Yup.string().required().default('Uncategorised');

export const code = Yup.lazy((value) => (
	stripIfBlankString(value)
		.max(50,
			formatMessage({
				id: 'validation.model.code.error.max',
				defaultMessage: 'Code is limited to 50 characters',
			}))
		.matches(/^[\w|_|-]*$/,
			formatMessage({
				id: 'validation.model.code.error.characters',
				defaultMessage: 'Code can only consist of letters, numbers, hyphens or underscores',
			}))
));

export const desc = Yup.lazy((value) => (
	stripIfBlankString(value)
		.max(660,
			formatMessage({
				id: 'validation.model.description.error.max',
				defaultMessage: 'Description is limited to 660 characters',
			}))
));

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
	)
	.test(
		'alreadyExistingTags',
		formatMessage({
			id: 'validation.model.tag.alreadyExisting',
			defaultMessage: 'This tag is already used within this container',
		}),
		async (tagValue, testContext) => {
			const { containerId } = testContext.parent;

			if (!containerId) return true; // Is a new container, it has no revisions

			const isPending = selectRevisionsPending(getState(), containerId);

			if (isPending) {
				const { teamspace, project }  = testContext.options.context;
				await new Promise((resolve) => RevisionsActionsDispatchers.fetch(teamspace, project, containerId, resolve as any));
			}

			const revisions = selectRevisions(getState(), containerId);
			return !revisions.find(({ tag }) => tagValue === tag);
		},
	);

export const revisionDesc = Yup.lazy((value) => (
	stripIfBlankString(value)
		.max(660,
			formatMessage({
				id: 'validation.revisions.desc.error.max',
				defaultMessage: 'Revision Description is limited to 660 characters',
			}))
));

export const uploadFile = Yup.mixed().nullable().test(
	'fileSize',
	formatMessage({
		id: 'validation.revisions.file.error.tooLarge',
		defaultMessage: 'File exceeds size limit of {sizeLimit}',
	}, { sizeLimit: filesize(ClientConfig.uploadSizeLimit) }),
	({ size }) => size && (size < ClientConfig.uploadSizeLimit),
);

export const lod = Yup.number();
