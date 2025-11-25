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

const { SUBSCRIPTION_TYPES } = require('../models/teamspaces.constants');
const Yup = require('yup');

const Subscription = {};

const schema = (requireDataOrCollaborators) => Yup.object().shape({
	collaborators: Yup.lazy((value) => {
		let dataType = Yup.number().min(0);
		if (value !== undefined && Number.isNaN(parseInt(value, 10))) {
			dataType = Yup.string().test('collaborator value check', 'must be number or unlimited', (v) => v === 'unlimited');
		}

		return dataType.optional();
	}),
	data: Yup.number().min(0),
	expiryDate: Yup.date().min(new Date()).nullable().transform((v, o) => (o !== null ? new Date(o) : null)),
}).required().noUnknown(true)
	.test('required properties test', (obj, context) => {
		if (obj.collaborators === undefined && obj.data === undefined && obj.expiryDate === undefined) {
			return context.createError({ message: 'Data must contain at least one of the specified fields' });
		}

		if (requireDataOrCollaborators && !obj.collaborators && !obj.data) {
			return context.createError({ message: 'Data must contain either collaborators or data' });
		}

		return true;
	});

const typeSchema = Yup.object().shape({ type: Yup.string().oneOf(Object.values(SUBSCRIPTION_TYPES)).required() });

Subscription.validateSchema = async (type, data, requireDataOrCollaborators) => {
	const [, output] = await Promise.all([
		typeSchema.validate({ type }),
		schema(requireDataOrCollaborators).validate(data),
	]);

	return output;
};

Subscription.isValidType = (type) => {
	try {
		typeSchema.validateSync({ type });
		return true;
	} catch {
		return false;
	}
};

module.exports = Subscription;
