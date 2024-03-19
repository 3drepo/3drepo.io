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
import { alphaNumericHyphens, desc, name, revisionDesc, uploadFile } from '../containerAndFederationSchemes/validators';
import { revisionName } from './validators';
import { formatMessage } from '@/v5/services/intl';
import { trimmedString } from '../shared/validators';

const drawingNumber = Yup.string().matches(alphaNumericHyphens,
	formatMessage({
		id: 'validation.drawing.drawingNumber',
		defaultMessage: 'Drawing Number can only consist of letters, numbers, hyphens or underscores',
	}))
	.required(
		formatMessage({
			id: 'validation.drawingNumber.error.required',
			defaultMessage: 'Drawing Number is a required field',
		}),
	).test(
		'alreadyExistingNumbers',
		formatMessage({
			id: 'validation.drawingNumber.alreadyExisting',
			defaultMessage: 'Your Drawing Number is already in use, please use a unique Drawing Number',
		}),
		(value, testContext) => {
			if (!testContext.options?.context) return true;
			return !testContext.options.context.alreadyExistingNumbers?.map((n) => n.trim().toLocaleLowerCase()).includes(value?.toLocaleLowerCase());
		},
	);

export const DrawingFormSchema =  Yup.object().shape({
	name,
	drawingNumber,
	desc,
});

const isSameCode = (codeA, codeB) => codeA?.toLocaleLowerCase() === codeB?.toLocaleLowerCase();
export const ListItemSchema = Yup.object().shape({
	file: uploadFile,
	revisionName,
	statusCode: trimmedString.matches(alphaNumericHyphens,
		formatMessage({
			id: 'validation.drawing.statusCode',
			defaultMessage: 'Status Code can only consist of letters, numbers, hyphens or underscores',
		})),
	revisionCode: trimmedString.matches(alphaNumericHyphens,
		formatMessage({
			id: 'validation.drawing.statusCode',
			defaultMessage: 'Status Code can only consist of letters, numbers, hyphens or underscores',
		}),
	).required(
		formatMessage({
			id: 'validation.revisionCode.required',
			defaultMessage: 'Revision Code is a required field',
		}),
	).test(
		'statusCodeAndRevisionCodeAreUnique',
		formatMessage({
			id: 'validation.statusCodeAndRevisionCodeUnique.error',
			defaultMessage: 'Combination Status Code and Revision Code must be unique',
		}),
		(revisionCode, testContext) => {
			if (!testContext.options?.context || !testContext.parent?.drawingNumber) return true;
			const revisionsByDrawingId = testContext.options.context.revisionsByDrawingId;
			const revisions = revisionsByDrawingId[testContext.parent.drawingId] || [];

			return !revisions.some((rev) => isSameCode(rev.statusCode, testContext.parent.statusCode) && isSameCode(rev.revisionCode, revisionCode));
		},
	),
	revisionDesc,
});

export const SidebarSchema = Yup.object().shape({
	drawingName: name,
	drawingNumber,
	drawingCategory: Yup.string().required(
		formatMessage({
			id: 'validation.drawingCategory.required',
			defaultMessage: 'Category is a required field',
		}),
	),
	drwaingDesc: desc,
});

export const UploadsSchema = Yup.object().shape({
	uploads: Yup
		.array()
		.of(ListItemSchema.concat(SidebarSchema))
		.required()
		.min(1),
});
