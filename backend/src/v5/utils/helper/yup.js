/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { UUIDToString, stringToUUID } = require('./uuids');
const { fileExtensionFromBuffer, isString, isUUID, isUUIDString } = require('./typeCheck');
const Yup = require('yup');
const { fileUploads } = require('../config');
const tz = require('countries-and-timezones');
const zxcvbn = require('zxcvbn');

const YupHelper = { validators: {}, types: { strings: {} }, utils: {} };

YupHelper.utils.stripWhen = (schema, cond) => Yup.lazy((value) => (cond(value) ? schema.strip() : schema));

YupHelper.validators.alphanumeric = (yupObj, allowFullStops) => yupObj.matches(
	allowFullStops ? /^[\w|_|.|-]*$/ : /^[\w|_|-]*$/,
	// eslint-disable-next-line no-template-curly-in-string
	`\${path} can only contain alpha-numeric characters, ${allowFullStops ? 'full stops, ' : ''}hyphens or underscores`);

YupHelper.types.id = Yup.string().uuid('ids are expected to be of uuid format').transform((val, org) => UUIDToString(org));

YupHelper.types.colorArr = Yup.array()
	.of(Yup.number().min(0).max(255).integer())
	.min(3).max(4);

YupHelper.types.color3Arr = Yup.array()
	.of(Yup.number().min(0).max(255).integer())
	.length(3);

YupHelper.types.strings.code = YupHelper.validators.alphanumeric(
	Yup.string().min(1).max(50).strict(true),
);

YupHelper.types.degrees = Yup.number().min(0).max(360);

YupHelper.types.strings.username = YupHelper.validators.alphanumeric(Yup.string().min(2).max(63).strict(true));

YupHelper.types.strings.title = Yup.string().min(1).max(120);

YupHelper.types.strings.countryCode = Yup.string().min(1).test('valid-country-code',
	'The country code provided is not valid', (value) => value === undefined || !!tz.getCountry(value));

// This is used for shorter descriptions such as revision desc, model desc, teamspace desc etc.
YupHelper.types.strings.shortDescription = Yup.string().min(1).max(660);

// This is used for longer descriptions such as groups, issues, risks
YupHelper.types.strings.longDescription = Yup.string().min(1).max(1200);

YupHelper.types.timestamp = Yup.number().min(new Date(2000, 1, 1).getTime()).integer()
	.transform((value, originalValue) => {
		if (originalValue === null) return null;
		const ts = new Date(originalValue).getTime();
		return ts > 0 ? ts : value;
	})
	.test(
		'Timestamp validation check',
		// eslint-disable-next-line no-template-curly-in-string
		'${path} is not a valid timestamp (ms since epoch)',
		(value) => new Date(value).getTime() > 0,
	);

YupHelper.types.position = Yup.array()
	.of(
		Yup.number(),
	).length(3);

YupHelper.types.position2d = Yup.array()
	.of(
		Yup.number(),
	).length(2);

YupHelper.types.surveyPoints = Yup.array()
	.of(
		Yup.object().shape({
			position: YupHelper.types.position.required(),
			latLong: YupHelper.types.position2d.required(),
		}),
	);

YupHelper.types.strings.unit = Yup.string()
	.oneOf(['mm', 'cm', 'dm', 'm', 'ft']);

YupHelper.types.strings.password = Yup.string().max(65)
	.test('checkPasswordStrength', 'Password is too weak',
		(value) => {
			if (value) {
				if (value.length < 8) return false;
				const passwordScore = zxcvbn(value).score;
				return passwordScore >= 2;
			}
			return true;
		});

YupHelper.types.strings.email = Yup.string().email();

YupHelper.types.strings.name = Yup.string().min(1).max(35);

YupHelper.types.date = Yup.date().transform((n, orgVal) => {
	if (orgVal === null) return orgVal;
	const valAsNum = Number(orgVal);
	return new Date(
		Number.isNaN(valAsNum) ? orgVal : valAsNum);
});

YupHelper.types.dateInThePast = YupHelper.types.date.test(('date-in-the-past', 'Date must be in the past', (v, { createError, path }) => {
	const now = new Date();
	if (!v || (now - v) >= 0) return true;
	return createError({ message: `${path || 'Date'} must be in the past` });
}));

const imageValidityTests = (yupType, isNullable) => yupType.test('image-validity-test', 'Image is not valid', async (value, { createError, originalValue }) => {
	const isImageRef = isUUIDString(originalValue) || isUUID(originalValue);
	if (isImageRef) {
		return true;
	}

	if (value === null && !isNullable) {
		return createError({ message: 'Image cannot be null' });
	}

	if (value) {
		if (value?.length > fileUploads.resourceSizeLimit) {
			return createError({ message: `Image must be smaller than ${fileUploads.resourceSizeLimit} Bytes` });
		}

		const ext = await fileExtensionFromBuffer(value);
		if (!ext || !fileUploads.imageExtensions.includes(ext.toLowerCase())) {
			return createError({ message: `Image must be of type ${fileUploads.imageExtensions.join(',')}` });
		}
	}

	return true;
});

YupHelper.types.embeddedImage = (isNullable) => imageValidityTests(
	Yup.mixed().transform((n, orgVal) => (orgVal ? Buffer.from(orgVal, 'base64') : n)),
	isNullable,
);

YupHelper.types.embeddedImageOrRef = () => imageValidityTests(
	Yup.mixed()
		.transform((currValue, orgVal) => {
			if (isString(orgVal)) {
				return isUUIDString(orgVal) ? stringToUUID(orgVal) : Buffer.from(orgVal, 'base64');
			}

			return currValue;
		}),
);

module.exports = YupHelper;
