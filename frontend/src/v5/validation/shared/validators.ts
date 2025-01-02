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
import { formatInfoUnit } from '@/v5/helpers/intl.helper';
import { formatMessage } from '@/v5/services/intl';
import { isNumber } from 'lodash';
import * as Yup from 'yup';

export const stripIfBlankString = (value) => (
	value === ''
		? Yup.string().strip()
		: Yup.string());

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

export const uploadFile = Yup.mixed().nullable().test(
	'fileSize',
	formatMessage({
		id: 'validation.revisions.file.error.tooLarge',
		defaultMessage: 'File exceeds size limit of {sizeLimit}',
	}, { sizeLimit: formatInfoUnit(ClientConfig.uploadSizeLimit) }),
	({ size }) => size && (size < ClientConfig.uploadSizeLimit),
);

export const alphaNumericHyphens = /^[\w-]*$/;

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
			if (!testContext.options?.context) return true;
			return !testContext.options.context.alreadyExistingNames?.map((n) => n.trim().toLocaleLowerCase()).includes(nameValue?.toLocaleLowerCase());
		},
	);

export const desc = Yup.lazy((value) => (
	stripIfBlankString(value)
		.max(660,
			formatMessage({
				id: 'validation.model.description.error.max',
				defaultMessage: 'Description is limited to 660 characters',
			}))
));

export const numberRange = (message?) => Yup.array().of(requiredNumber().test(
	'invalidRange',
	message || formatMessage({
		id: 'validation.range.error.invalidRange',
		defaultMessage: 'Invalid range',
	}),
	(v, ctx) => {
		if (ctx.parent.some((x) => !isNumber(x))) return true;
		return ctx.parent[0] < ctx.parent[1];
	},
));
