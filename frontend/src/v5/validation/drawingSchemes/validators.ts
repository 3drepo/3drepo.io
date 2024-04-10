/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { alphaNumericHyphens } from '../shared/validators';
import { selectRevisions } from '@/v5/store/drawings/revisions/drawingRevisions.selectors';
import { getState } from '@/v4/modules/store';

export const revisionName = Yup.string()
	.max(50,
		formatMessage({
			id: 'validation.revisions.name.error.error.max',
			defaultMessage: 'Revision Name is limited to 50 characters',
		}))
	.matches(alphaNumericHyphens,
		formatMessage({
			id: 'validation.revisions.name.error.characters',
			defaultMessage: 'Revision Name can only consist of letters, numbers, hyphens or underscores',
		}))
	.required(
		formatMessage({
			id: 'validation.revisions.name.error.required',
			defaultMessage: 'Revision Name is a required field',
		}),
	)
	.test(
		'alreadyExistingName',
		formatMessage({
			id: 'validation.model.name.alreadyExisting',
			defaultMessage: 'This name is already used within this drawing',
		}),
		async (nameValue, testContext) => {
			const { drawingId } = testContext.parent;
			if (!drawingId) return true; // Is a new drawing, it has no revisions

			const revisions = selectRevisions(getState(), drawingId);
			return !revisions.find(({ name }) => nameValue === name);
		},
	);