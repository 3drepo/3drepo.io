/**
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

const { doesAccountExist, getTeamspaceByAccount } = require('../services/sso/frontegg');
const Yup = require('yup');
const YupHelper = require('../utils/helper/yup');
const { getTeamspaceSetting } = require('../models/teamspaceSettings');

const Teamspaces = {};

const newTeamspaceSchema = Yup.object().shape({
	name: YupHelper.validators.alphanumeric(YupHelper.types.strings.title.required()
		.test('check-name-is-not-used', 'Teamspace with this name already exists.', async (value) => {
			if (!value) return true;
			try {
				await getTeamspaceSetting(value, { _id: 1 });
				return false;
			} catch {
				return true;
			}
		}), false),
	admin: YupHelper.types.strings.email,
	accountId: Yup.string()
		.test('check-account-exists', 'Account with this ID does not exist.', (value) => {
			if (!value) return true;
			return doesAccountExist(value);
		}).test('check-account-has-no-teamspace', 'Account with this ID is already associated with another teamspace.', async (value) => {
			if (!value) return true;
			const teamspace = await getTeamspaceByAccount(value);
			return teamspace === undefined;
		}),
});

Teamspaces.validateNewTeamspaceSchema = (data) => newTeamspaceSchema.validate(data, { stripUnknown: true });

module.exports = Teamspaces;
