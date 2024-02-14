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
import { formatMessage } from '@/v5/services/intl';
import { isNumber } from 'lodash';
import * as Yup from 'yup';

export const trimmedString = Yup.string().transform((value) => value && value.trim());

export const nullableString = Yup.string().transform((value) => value || null).nullable();

export const nullableNumber = Yup.number().transform(
	(_, val) => ((val || val === 0) ? Number(val) : null),
).nullable(true);

export const requiredNumber = (requiredError?) => nullableNumber.test(
	'requiredNumber',
	requiredError || formatMessage({
		id: 'validation.number.required',
		defaultMessage: 'This is required',
	}),
	(number) => isNumber(number),
);

export const getMaxFileSizeMessage = (value) => formatMessage({
	id: 'validation.file.error.fileSize',
	defaultMessage: 'The file you tried to upload was too big. File uploads should be no larger than {value}.',
}, { value });
