/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const Path = require('path');

const { v5Path } = require('../../../interop');

const config = require(`${v5Path}/utils/config`);
const { getTeamspaceList } = require('../../utils');

const { sendEmail } = require(`${v5Path}/services/mailer`);
const { getTeamspaceActiveLicenses } = require(`${v5Path}/models/teamspaceSettings`);
const { templates } = require(`${v5Path}/services/mailer/mailer.constants`);

const run = async () => {
	const teamspaces = await getTeamspaceList();
	const currentDate = new Date();
	const expiryThreshold = new Date();
	expiryThreshold.setDate(currentDate.getDate() + 30);

	const activeTeamspaces = await Promise.all(
		teamspaces.map((teamspace) => getTeamspaceActiveLicenses(teamspace)),
	);
	const teamspacesToExpire = activeTeamspaces.filter((ts) => !!ts
		&& ts.subscriptions
		&& Object
			.values(ts.subscriptions)
			.some((sub) => sub.expiryDate && new Date(sub.expiryDate) <= expiryThreshold),
	).map((ts) => ({
		teamspace: ts._id,
		expiryDate: Object.values(ts.subscriptions)[0].expiryDate,
	}));

	if (teamspacesToExpire.length) {
		await sendEmail(templates.INTERNAL_TEAMSPACE_EXPIRY_LIST.name, config.mail.sender, { firstName: 'Support', teamspacesToExpire });
	}
};

const genYargs = /* istanbul ignore next */(yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));
	return yargs.command(commandName,
		'Send internal teamspace expiry email',
		() => {},
		() => run());
};

module.exports = {
	run,
	genYargs,
};
