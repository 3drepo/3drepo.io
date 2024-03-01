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

const { v5Path } = require('../../../interop');

const { defaultTemplates } = require(`${v5Path}/models/tickets.templates.constants`);

const clashTemplate = defaultTemplates.find(({ code }) => code === 'CSH');

const { getTeamspaceList } = require('../../utils');

const { getTemplateByCode, getTemplateById, addDefaultTemplates } = require(`${v5Path}/models/tickets.templates`);
const { templates } = require(`${v5Path}/utils/responseCodes`);
const { logger } = require(`${v5Path}/utils/logger`);

const processTeamspace = async (teamspace) => {
	try {
		await getTemplateById(teamspace, clashTemplate._id);
	} catch (err) {
		if (err.code === templates.templateNotFound.code) {
			// make sure the code isn't currently used
			const codeUsed = await getTemplateByCode(teamspace, clashTemplate.code).catch(() => false);
			if (codeUsed) {
				throw new Error(`[${teamspace}] Template code ${clashTemplate.code} is already in use.`);
			}
			await addDefaultTemplates(teamspace);
		} else {
			throw err;
		}
	}
};

const run = async () => {
	if (!clashTemplate) throw new Error('Could not find default clash template!');

	const teamspaces = await getTeamspaceList();
	for (const teamspace of teamspaces) {
		logger.logInfo(`-${teamspace}`);
		// eslint-disable-next-line no-await-in-loop
		await processTeamspace(teamspace);
	}
};

module.exports = run;
