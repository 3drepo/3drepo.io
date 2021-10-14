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

YupHelper.types.id = Yup.string().uuid('ids are expected to be of uuid format').transform((val, org) => UUIDToString(org));

YupHelper.types.colorArr = Yup.array()
	.of(Yup.number().min(0).max(255).integer())
	.min(3).max(4);

YupHelper.types.strings.username = Yup.string().min(2).max(65).strict(true)
	.matches(/^[\w]{1,64}$/,
	// eslint-disable-next-line no-template-curly-in-string
		'${path} cannot be longer than 64 characters and must only contain alphanumeric characters and underscores');
YupHelper.types.strings.title = Yup.string().min(1).max(120);

YupHelper.types.strings.blob = Yup.string().min(1).max(650);

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

YupHelper.types.strings.position = Yup.array()
.of(
	Yup.number().strict(true)
).test('test-divisibleByThree','position array must be divisible by 3', function(array) {	
	return array.length % 3 === 0;
});

YupHelper.types.strings.unit = Yup.string()
	.oneOf(['mm', 'cm', 'dm', 'm', 'ft']).strict(true);


module.exports = YupHelper;
