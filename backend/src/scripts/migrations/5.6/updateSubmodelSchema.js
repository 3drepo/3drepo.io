/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const { some } = require('lodash');

const { v5Path } = require('../../../interop');

const { getTeamspaceList } = require('../../utils');

const { find, bulkWrite } = require(`${v5Path}/handler/db`);
const { logger } = require(`${v5Path}/utils/logger`);
const { isString } = require(`${v5Path}/utils/helper/typeCheck`);

/* eslint-disable no-await-in-loop */

const settingsCol = 'settings';

const processTeamspace = async (teamspace) => {
	const fedsToUpdate = await find(teamspace, settingsCol, { federate: true }, { subModels: 1 });

	const updateInstr = [];
	for (const { _id, subModels } of fedsToUpdate) {
		if (some(subModels, isString)) {
			updateInstr.push({ updateOne: {
				filter: { _id },
				update: { $set: {
					subModels: subModels.map((id) => ({ _id: id })),
				} },
			} });
		}
	}

	if (updateInstr.length) {
		await bulkWrite(teamspace, settingsCol, updateInstr);
	}
};

const run = async () => {
	const teamspaces = await getTeamspaceList();
	for (const teamspace of teamspaces) {
		logger.logInfo(`-${teamspace}`);
		await processTeamspace(teamspace);
	}
};

/* eslint-disable no-await-in-loop */
module.exports = run;
