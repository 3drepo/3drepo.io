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
import { alphaNumericHyphens, stripIfBlankString } from '../shared/validators';
import { selectRevisions } from '@/v5/store/containers/revisions/containerRevisions.selectors';
import { getState } from '@/v5/helpers/redux.helpers';

export const nullableNumberField = Yup.number()
	.transform((value) => (Number.isNaN(value) ? null : value))
	.nullable();

export const unit = Yup.string().required().oneOf(['mm', 'cm', 'dm', 'm', 'ft']).default('mm');
export const type = Yup.string().required().default('Uncategorised');

export const code = Yup.lazy((value) => (
	stripIfBlankString(value)
		.max(50,
			formatMessage({
				id: 'validation.model.code.error.max',
				defaultMessage: 'Code is limited to 50 characters',
			}))
		.matches(alphaNumericHyphens,
			formatMessage({
				id: 'validation.model.code.error.characters',
				defaultMessage: 'Code can only consist of letters, numbers, hyphens or underscores',
			}))
));

export const revisionTag = Yup.string()
	.max(50,
		formatMessage({
			id: 'validation.revisions.tag.error.error.max',
			defaultMessage: 'Revision Name is limited to 50 characters',
		}))
	.matches(alphaNumericHyphens,
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
		(value, testContext) => {
			const revisions = selectRevisions(getState(), testContext.parent.containerId);
			return !revisions?.map(({ tag }) => tag.trim().toLocaleLowerCase()).includes(value?.toLocaleLowerCase());
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

export const lod = Yup.number();
