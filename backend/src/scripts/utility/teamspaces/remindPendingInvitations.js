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
const { getUserByUsername } = require('../../../v5/models/users');

const { ADMIN_DB } = require(`${v5Path}/handler/db.constants`);
const { find } = require(`${v5Path}/handler/db`);
const { sendEmail } = require(`${v5Path}/services/mailer`);
const { templates } = require(`${v5Path}/services/mailer/mailer.constants`);
const { logger } = require(`${v5Path}/utils/logger`);

const INVITATIONS_COL = 'invitations';
const EXPIRATION_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const sendEmailToUser = async (template, to, data) => {
	try {
		await sendEmail(template, to, data);
		return true;
	} catch (err) {
		logger.logError(`Failed to send ${template} email to ${to}: ${err.message}`);
		return false;
	}
};

const getDaysLeft = (invitedAt) => {
	const expiresAt = new Date(invitedAt).getTime() + EXPIRATION_DAYS * DAY_MS;
	return Math.ceil((expiresAt - Date.now()) / DAY_MS);
};

const sendEmailsToInvitees = async (invitations, teamspace) => {
	let emailsSent = 0;
	const inviterList = [];

	await Promise.all(invitations.map(async (invitation) => {
		const { _id: inviteeEmail, teamSpaces } = invitation;
		const { invitedAt, invitedBy } = teamSpaces[0];

		if (invitedAt && invitedBy) {
			const daysToExpire = getDaysLeft(invitedAt);

			if (daysToExpire <= 0) {
				return;
			}

			if (daysToExpire === 1) {
				inviterList.push({ invitedBy, inviteeEmail });
			}

			const sent = await sendEmailToUser(templates.INVITEE_REMINDER.name, inviteeEmail,
				{ teamspace, firstName: inviteeEmail, daysToExpire });

			if (sent) {
				emailsSent++;
			}
		}
	}));

	logger.logInfo(`Sent ${emailsSent} emails to invitees`);
	return inviterList;
};

const sendEmailsToInviters = async (inviterList, teamspace) => {
	let emailsSent = 0;

	const uniqueInviterIds = new Set(inviterList.map(({ invitedBy }) => invitedBy));
	const inviters = await Promise.all([...uniqueInviterIds].map(async (id) => {
		try {
			const { customData } = await getUserByUsername(id, { 'customData.email': 1, 'customData.firstName': 1 });
			return [id, customData];
		} catch {
			logger.logError(`Could not find inviter ${id}`);
			return undefined;
		}
	}));

	const invitersData = new Map(inviters.filter(Boolean));

	await Promise.all(inviterList.map(async ({ invitedBy, inviteeEmail: invitee }) => {
		const inviterData = invitersData.get(invitedBy);

		if (inviterData) {
			const emailSent = await sendEmailToUser(templates.INVITER_REMINDER.name, inviterData.email,
				{ teamspace, firstName: inviterData.firstName, inviteeEmail: invitee });

			if (emailSent) {
				emailsSent++;
			}
		}
	}));

	logger.logInfo(`Sent ${emailsSent} emails to inviters`);
};

const sendReminders = async (teamspace) => {
	const invitations = await find(ADMIN_DB, INVITATIONS_COL, { 'teamSpaces.teamspace': teamspace }, { 'teamSpaces.$': 1 });
	const inviterList = await sendEmailsToInvitees(invitations, teamspace);
	await sendEmailsToInviters(inviterList, teamspace);
};

const run = async (teamspace) => {
	logger.logInfo(`Checking pending invitations for ${teamspace}`);
	await sendReminders(teamspace);
};

const genYargs = /* istanbul ignore next */ (yargs) => {
	const commandName = Path.basename(__filename, Path.extname(__filename));

	const argsSpec = (subYargs) => subYargs.option('teamspace',
		{
			describe: 'teamspace to check',
			type: 'string',
			demandOption: true,
		});

	return yargs.command(commandName,
		'Remind invitees and inviters about pending invitations in a teamspace',
		argsSpec,
		({ teamspace }) => run(teamspace));
};

module.exports = {
	run,
	genYargs,
};
