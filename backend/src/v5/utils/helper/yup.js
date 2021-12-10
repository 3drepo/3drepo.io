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

const { UUIDToString } = require('./uuids');
const Yup = require('yup');

const YupHelper = { validators: {}, types: { strings: {} } };

YupHelper.validators.alphanumeric = (yupObj) => yupObj.matches(/^[\w|_|-]*$/,
	// eslint-disable-next-line no-template-curly-in-string
	'${path} can only contain alpha-numeric characters, hypens or underscores');

YupHelper.types.id = Yup.string().uuid('ids are expected to be of uuid format').transform((val, org) => UUIDToString(org));

YupHelper.types.colorArr = Yup.array()
	.of(Yup.number().min(0).max(255).integer())
	.min(3).max(4);

YupHelper.types.strings.code = YupHelper.validators.alphanumeric(
	Yup.string().min(1).max(50).strict(true),
);

YupHelper.types.degrees = Yup.number().min(0).max(360);

YupHelper.types.strings.username = YupHelper.validators.alphanumeric(Yup.string().min(2).max(65).strict(true));

YupHelper.types.strings.title = Yup.string().min(1).max(120);

// This is used for shorter descriptions such as revision desc, model desc, teamspace desc etc.
YupHelper.types.strings.shortDescription = Yup.string().min(1).max(660);

// This is used for longer descriptions such as groups, issues, risks
YupHelper.types.strings.longDescription = Yup.string().min(1).max(1200);

YupHelper.types.timestamp = Yup.number().min(new Date(2000, 1, 1).getTime()).integer()
	.transform((value, originalValue) => {
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

YupHelper.types.surveyPoints = Yup.array()
	.of(
		Yup.object().shape({
			position: YupHelper.types.position.required(),
			latLong: Yup.array().of(Yup.number()).length(2).required(),
		}),
	);

YupHelper.types.strings.unit = Yup.string()
	.oneOf(['mm', 'cm', 'dm', 'm', 'ft']);

module.exports = YupHelper;
