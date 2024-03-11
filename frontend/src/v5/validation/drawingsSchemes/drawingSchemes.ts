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
import { alphaNumericHyphens, desc, name } from '../containerAndFederationSchemes/validators';
import { formatMessage } from '@/v5/services/intl';


export const CreateDrawingSchema =  Yup.object().shape({
	name,
	drawingNumber: Yup.string().matches(alphaNumericHyphens,
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
		)
	,
	desc,
});
