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
import { revisionDesc } from '../containerAndFederationSchemes/validators';
import { desc, name, alphaNumericHyphens, trimmedString, numberRange } from '../shared/validators';
import { formatMessage } from '@/v5/services/intl';
import { selectRevisions } from '@/v5/store/drawings/revisions/drawingRevisions.selectors';
import { getState } from '@/v5/helpers/redux.helpers';

const number = Yup.string()
	.matches(alphaNumericHyphens,
		formatMessage({
			id: 'validation.drawing.number.error.characters',
			defaultMessage: 'Drawing Number can only consist of letters, numbers, hyphens or underscores',
		}))
	.max(50,
		formatMessage({
			id: 'validation.drawing.number.error.max',
			defaultMessage: 'Drawing Number is limited to 50 characters',
		}))
	.required(
		formatMessage({
			id: 'validation.drawing.number.error.required',
			defaultMessage: 'Drawing Number is a required field',
		}),
	).test(
		'alreadyExistingNumbers',
		formatMessage({
			id: 'validation.drawing.number.error.alreadyExisting',
			defaultMessage: 'Your Drawing Number is already in use, please use a unique Drawing Number',
		}),
		(value, testContext) => {
			if (!testContext.options?.context) return true;
			const { existingNumbers } = testContext.options?.context as {existingNumbers: Set<string>};
			return !existingNumbers.has(value?.toLowerCase().trim());
		},
	);

export const CALIBRATION_INVALID_RANGE_ERROR = formatMessage({
	id: 'validation.drawing.calibration.error.invalidRange',
	defaultMessage: 'Bottom extent should be smaller than top',
});
const calibration = Yup.object().shape({
	units: Yup.string().required(formatMessage({
		id: 'validation.drawing.calibration.units.error.required',
		defaultMessage: 'Units is a required field',
	})),
	verticalRange: numberRange(CALIBRATION_INVALID_RANGE_ERROR),
});

export const DrawingFormSchema =  Yup.object().shape({
	name,
	number,
	desc,
	calibration,
});

const isSameCode = (codeA = '', codeB = '') => codeA.toLocaleLowerCase().trim() === codeB.toLocaleLowerCase().trim();
const testCombinationIsUnique = (val, testContext) => {
	if (!testContext.options?.context || !testContext.parent?.drawingId) return true;
	const revisions = selectRevisions(getState(), testContext.parent.drawingId);
	return !revisions.some((rev) => isSameCode(rev.statusCode, testContext.parent.statusCode) && isSameCode(rev.revCode, testContext.parent.revCode));
};

const statusCodeAndRevisionCodeMustBeUniqueMessage = formatMessage({
	id: 'validation.drawing.statusCode.error.characters',
	defaultMessage: 'The combination of Status Code and Revision Code must be unique',
});

export const isUniqueRevisionStatusError = (error) => error === statusCodeAndRevisionCodeMustBeUniqueMessage;

export const ListItemSchema = Yup.object().shape({
	statusCode: Yup.string().required(
		formatMessage({
			id: 'validation.drawing.statusCode.error.required',
			defaultMessage: 'Status Code is a required field',
		})).test(
		'statusCodeAndRevisionCodeAreUnique',
		statusCodeAndRevisionCodeMustBeUniqueMessage,
		testCombinationIsUnique,
	),
	revCode: trimmedString.matches(alphaNumericHyphens,
		formatMessage({
			id: 'validation.drawing.revCode.error.characters',
			defaultMessage: 'Revision Code can only consist of letters, numbers, hyphens or underscores',
		})).required(
		formatMessage({
			id: 'validation.drawing.revCode.error.required',
			defaultMessage: 'Revision Code is a required field',
		})).max(10,
		formatMessage({
			id: 'validation.drawing.revCode.error.max',
			defaultMessage: 'Revision Code is limited to 10 characters',
		})).test(
		'statusCodeAndRevisionCodeAreUnique',
		statusCodeAndRevisionCodeMustBeUniqueMessage,
		testCombinationIsUnique),
	revisionDesc,
});

export const SidebarSchema = Yup.object().shape({
	drawingName: name,
	drawingNumber: number,
	drawingType: Yup.string().required(
		formatMessage({
			id: 'validation.drawing.drawingType.error.required',
			defaultMessage: 'Category is a required field',
		}),
	),
	drawingDesc: desc,
	calibration,
	revisionDesc: desc,
});

export const UploadsSchema = Yup.object().shape({
	uploads: Yup
		.array()
		.of(ListItemSchema.concat(SidebarSchema))
		.required()
		.min(1),
});
