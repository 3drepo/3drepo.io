/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const { createResponseCode, templates } = require('../../../../utils/responseCodes');
const { getArrayDifference, uniqueElements } = require('../../../../utils/helper/arrays');
const { getRoleById, getRoleByName } = require('../../../../models/roles');
const Yup = require('yup');
const { getAllUsersInTeamspace } = require('../../../../models/teamspaceSettings');
const { respond } = require('../../../../utils/responder');
const { types } = require('../../../../utils/helper/yup');
const { validateMany } = require('../../../common');

const Roles = {};

const nameExists = (teamspace, name) => getRoleByName(teamspace, name, { _id: 1 })
	.then(() => true).catch(() => false);

const validateRole = async (req, res, next) => {
	const isUpdate = !!req.roleData;

	let schema = Yup.object().shape({
		name: (isUpdate ? types.strings.title : types.strings.title.required())
			.test('check-name-is-unique', 'Role with the same name already exists', async (value) => {
				if (value !== req.roleData?.name) {
					const nameTaken = await nameExists(req.params.teamspace, value);
					return !nameTaken;
				}

				return true;
			}),
		users: Yup.array().of(types.strings.title)
			.test('users-uniqueness-check', 'users must be unique', (values) => {
				if (!values?.length) return true;
				return values.length === uniqueElements(values).length;
			})
			.test('check-users-teamspace-access', async (values, context) => {
				if (values?.length) {
					const teamspaceUsers = await getAllUsersInTeamspace(req.params.teamspace);
					const usersWithNoAccess = getArrayDifference(teamspaceUsers, values);
					if (usersWithNoAccess.length) {
						return context.createError({ message: `User(s) ${usersWithNoAccess} have no access to the teamspace` });
					}
				}

				return true;
			}),

		color: Yup.string().matches(/^#[0-9A-Fa-f]{6}$/, 'color is not a valid RGB hex format'),
	}).strict(true).noUnknown();

	if (isUpdate) {
		schema = schema.test(
			'at-least-one-property',
			'You must provide at least one role value',
			(value) => Object.keys(value).length,
		);
	}

	try {
		await schema.validate(req.body);
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Roles.roleExists = async (req, res, next) => {
	try {
		const { teamspace, role } = req.params;

		req.roleData = await getRoleById(teamspace, role, { _id: 1, name: 1 });
		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

Roles.validateNewRole = validateRole;
Roles.validateUpdateRole = validateMany([Roles.roleExists, validateRole]);

module.exports = Roles;
