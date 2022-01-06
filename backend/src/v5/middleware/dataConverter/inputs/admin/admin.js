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
const { createResponseCode, templates } = require('../../../../utils/responseCodes');
const { SYSTEM_ROLES } = require('../../../../utils/permissions/permissions.constants');
const { getUserByUsername } = require('../../../../models/users');
const { isArray } = require('lodash');
const { respond } = require('../../../../utils/responder');

const Yup = require('yup');

const Admin = {};

Admin.validatePayload = async (req, res, next) => {
	const schema = Yup.object().shape({ users:
		Yup.array().of(
			Yup.object().shape({
				user: Yup.string().required(),
				role: Yup.string().required(),
			}),
		).min(1, 'users array must have at least 1')
		,
	}).strict(true).noUnknown()
		.required();
	try {
		await schema.validate(req.body);
		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Admin.validateQueries = async (req, res, next) => {
	const { user, role } = req.query;
	const schemaUser = Yup.string().required().min(1);
	try {
		if (isArray(role)) {
			role.forEach((r) => {
				if (!SYSTEM_ROLES.includes(r)) {
					throw createResponseCode(templates.invalidArguments, `The role ${r} provided is not a system role`);
				}
			});
		} else if (role) {
			if (!SYSTEM_ROLES.includes(role)) {
				throw createResponseCode(templates.invalidArguments, `The role ${role} provided is not a system role`);
			}
		}
		if (isArray(user)) {
			user.forEach(async (u) => {
				await schemaUser.validate(u);
			});
		} else if (user) await schemaUser.validate(user);
		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Admin.validateUsersAndRoles = async (req, res, next) => {
	try {
		const { users } = req.body;
		const checkedValues = users.map(async (user) => {
			const [userExists, roleExists] = await Promise.all([
				getUserByUsername(user.user),
				SYSTEM_ROLES.includes(user.role),
			]);
			if (!userExists) throw createResponseCode(templates.userNotFound, `${user.user} is not a user`);
			if (!roleExists) throw createResponseCode(templates.roleNotFound, `The role ${user.role} provided is not a system role`);
		});
		await Promise.all(checkedValues);
		next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Admin;
