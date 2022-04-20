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

const { SUBSCRIPTION_TYPES } = require('../../../models/teamspaces.constants');
const Yup = require('yup');

const Subscription = {};

const schema = Yup.object().shape({
	collaborators: Yup.lazy((value) => {
		switch (typeof value) {
		case 'string':
			return Yup.string().test('collaborator value check', 'must be number or unlimited', (v) => v === 'unlimited');
		default:
			return Yup.number().min(0).optional();
		}
	}),
	data: Yup.number().min(0),
	expiryDate: Yup.date().min(new Date()).nullable().transform((v, o) => (o !== null ? new Date(o) : null)),
}).required().noUnknown(true)
	.test('Empty object test', 'Data must contain at least one of the specified fields', (obj) => obj.collaborators !== undefined
			|| obj.data !== undefined
			|| obj.expiryDate !== undefined);

const typeSchema = Yup.string().oneOf(SUBSCRIPTION_TYPES).required();

Subscription.validateSchema = async (type, data) => {
	const [, output] = await Promise.all([
		typeSchema.validate(type),
		schema.validate(data),
	]);

	return output;
};

module.exports = Subscription;
