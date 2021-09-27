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

const Yup = require('yup');

const YupHelper = { validators: {}, types: { strings: {} } };

YupHelper.types.id = Yup.string().uuid('ids are expected to be of uuid format');

YupHelper.types.colorArr = Yup.array()
	.of(Yup.number().min(0).max(255).integer())
	.min(3).max(4)
	.strict(true);

YupHelper.types.strings.username = Yup.string().min(2).max(65).matches(/^[\w]{1,64}$/,
	// eslint-disable-next-line no-template-curly-in-string
	'${path} cannot be longer than 64 characters and must only contain alphanumeric characters and underscores');
YupHelper.types.strings.title = Yup.string().min(1).max(120);

YupHelper.types.strings.blob = Yup.string().min(1).max(650);

YupHelper.types.timestamp = Yup.number().min(new Date(2000, 1, 1).getTime()).integer()
	.test(
		'Timestamp validation check',
		// eslint-disable-next-line no-template-curly-in-string
		'${path} is not a valid timestamp (ms since epoch)',
		(value) => new Date(value).getTime() > 0,
	);

module.exports = YupHelper;
