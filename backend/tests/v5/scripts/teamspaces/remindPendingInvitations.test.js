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

const { determineTestGroup } = require('../../helper/utils');
const {
	db: { reset: resetDB, createUser, createTeamspace },
	generateRandomString,
	generateUserCredentials,
} = require('../../helper/services');

const { src, utilScripts } = require('../../helper/path');

jest.mock('../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);

const { templates } = require(`${src}/services/mailer/mailer.constants`);
const { ADMIN_DB } = require(`${src}/handler/db.constants`);
const { disconnect, insertMany } = require(`${src}/handler/db`);
const JobsConstants = require(`${src}/models/jobs.constants`);

const RemindPendingInvitations = require(`${utilScripts}/teamspaces/remindPendingInvitations`);

const INVITATIONS_COL = 'invitations';
const DAY_MS = 24 * 60 * 60 * 1000;

const dateInThePast = (daysAgo) => new Date(Date.now() - (daysAgo + 0.5) * DAY_MS);

const generateEmail = () => `${generateRandomString()}@example.com`;

const generateInvitation = (teamspace, invitedAt, invitedBy) => ({
	_id: generateEmail(),
	teamSpaces: [{
		teamspace,
		job: JobsConstants.DEFAULT_JOBS[0]._id,
		permissions: { teamspace_admin: true },
		invitedAt,
		invitedBy,
	}],
});

const generateData = () => {
	const teamspace = 'teamspace1';
	const teamspace2 = 'teamspace2';
	const user1 = generateUserCredentials();
	const user2 = generateUserCredentials();

	const expiredInvitations = [teamspace, teamspace2]
		.map((ts) => [
			generateInvitation(ts, dateInThePast(10), user1.user),
			generateInvitation(ts, dateInThePast(10), user2.user),
		]).flat();

	const activeInvitations = [teamspace, teamspace2]
		.map((ts) => [
			generateInvitation(ts, dateInThePast(3), user1.user),
			generateInvitation(ts, dateInThePast(6), user1.user),
			generateInvitation(ts, dateInThePast(3), user2.user),
			generateInvitation(ts, dateInThePast(6), user2.user),
		]).flat();

	const unknownUserInvitation = generateInvitation(teamspace, dateInThePast(1), generateRandomString());

	return { teamspace, teamspace2, user1, user2, activeInvitations, expiredInvitations, unknownUserInvitation };
};

const setupData = async ({ teamspace, users, invitations }) => {
	await Promise.all(users.map((user) => createUser(user)));
	await createTeamspace(teamspace, users.map(({ user }) => user));
	await insertMany(ADMIN_DB, INVITATIONS_COL, invitations);
};

const runTest = () => {
	describe('Remind pending invitations', () => {
		const data = generateData();
		const { teamspace, teamspace2, user1, user2,
			activeInvitations, expiredInvitations, unknownUserInvitation } = data;

		beforeEach(async () => {
			await resetDB();
			await setupData({ users: [user1, user2],
				teamspace,
				invitations: [...activeInvitations, ...expiredInvitations, unknownUserInvitation] });
			Mailer.sendEmail.mockReset();
		});

		test('should send emails to inviters and invitees for all active invitations', async () => {
			await RemindPendingInvitations.run(teamspace);

			const { calls } = Mailer.sendEmail.mock;

			const inviterEmails = calls.filter(([name]) => name === templates.INVITER_REMINDER.name);
			expect(inviterEmails.length).toBe(2);
			expect(inviterEmails).toEqual(
				expect.arrayContaining([
					expect.arrayContaining([templates.INVITER_REMINDER.name, user1.basicData.email]),
					expect.arrayContaining([templates.INVITER_REMINDER.name, user2.basicData.email]),
				]),
			);

			const expectedInvitees = [...activeInvitations, unknownUserInvitation]
				.filter(({ teamSpaces }) => teamSpaces[0] === teamspace)
				.map(({ _id }) => _id);
			const inviteeEmails = calls.filter(([name]) => name === templates.INVITEE_REMINDER.name);
			expect(inviteeEmails.length).toBe(5);
			expect(inviteeEmails).toEqual(
				expect.arrayContaining(
					expectedInvitees.map((email) => expect.arrayContaining([templates.INVITEE_REMINDER.name, email])),
				),
			);
		});

		test('should keep sending the remaining emails if one of them fails', async () => {
			Mailer.sendEmail.mockImplementation((template, to) => {
				if (to === activeInvitations[5]._id) {
					throw new Error(generateRandomString());
				}
			});

			await expect(RemindPendingInvitations.run(teamspace2))
				.resolves.not.toThrow();

			const { calls } = Mailer.sendEmail.mock;
			const inviterEmails = calls.filter(([name]) => name === templates.INVITER_REMINDER.name);
			expect(inviterEmails.length).toBe(2);
			expect(inviterEmails).toEqual(
				expect.arrayContaining([
					expect.arrayContaining([templates.INVITER_REMINDER.name, user2.basicData.email]),
				]),
			);

			const inviteeEmails = calls.filter(([name]) => name === templates.INVITEE_REMINDER.name);
			expect(inviteeEmails.length).toBe(4);
		});

		test('should not send any email if the teamspace has no invitations', async () => {
			await RemindPendingInvitations.run(generateRandomString());

			expect(Mailer.sendEmail).not.toHaveBeenCalled();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
