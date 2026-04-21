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

const { times } = require('lodash');

const {
	determineTestGroup,
	db: { reset: resetDB, createTeamspace, createUser },
	generateUserCredentials,
} = require('../../helper/services');

const { src, utilScripts } = require('../../helper/path');

const config = require(`${src}/utils/config`);

const { templates: emailTemplates } = require(`${src}/services/mailer/mailer.constants`);

const checkTeamspaceExpiry = require(`${utilScripts}/teamspaces/checkTeamspaceExpiry`);
const { editSubscriptions } = require(`${src}/models/teamspaceSettings`);

const User = require(`${src}/models/users`);

jest.mock('../../../../src/v5/services/mailer');
const { sendEmail } = require(`${src}/services/mailer`);

const { disconnect, updateMany } = require(`${src}/handler/db`);
const { USERS_COL, USERS_DB_NAME } = require(`${src}/models/users.constants`);

const setupData = async ({ users, ...teamspaces }) => {
	const currentDate = new Date();
	const expiryThreshold = new Date();
	expiryThreshold.setDate(currentDate.getDate() + 30);
	const expiryWithinThreshold = new Date();
	expiryWithinThreshold.setDate(currentDate.getDate() + 15);
	const expiryToday = new Date();
	expiryToday.setHours(12, 0, 0, 0);
	const expiredYesterday = new Date();
	expiredYesterday.setDate(currentDate.getDate() - 1);
	expiredYesterday.setHours(12, 0, 0, 0);
	const expireInFourDays = new Date(currentDate);
	expireInFourDays.setDate(currentDate.getDate() + 4);
	const expireInTwoDays = new Date(currentDate);
	expireInTwoDays.setDate(currentDate.getDate() + 2);
	const expireInTenDays = new Date(currentDate);
	expireInTenDays.setDate(currentDate.getDate() + 10);

	await Promise.all([
		...users.map((user) => ({ ...user, userId: user.user })),
		teamspaces.teamspaceWithMultipleExpiringSubscriptions,
		teamspaces.teamspaceExpiringIn30Days,
		teamspaces.teamspaceExpiringToday,
		teamspaces.teamspaceExpiringIn30DaysMultipleAdmins,
		teamspaces.teamspaceExpiringTodayMultipleAdmins,
		teamspaces.teamspaceNotExpiring].map((entry) => createUser(entry)),
	);

	// update the userId field so that the data can look like it would in prod
	await Promise.all(users.map(
		({ user }) => updateMany(USERS_DB_NAME, USERS_COL, { user }, { $set: { userId: user } }),
	));

	await Promise.all([
		createTeamspace(
			teamspaces.teamspaceWithMultipleExpiringSubscriptions.user,
			[users[0].user],
			{
				internal: { expiryDate: expireInFourDays },
				pilot: { expiryDate: expiredYesterday },
				discretionary: { expiryDate: expireInTenDays },
				enterprise: { expiryDate: null },
			},
			false),
		createTeamspace(
			teamspaces.teamspaceExpiringIn30Days.user,
			[users[0].user],
			{ internal: { expiryDate: expiryWithinThreshold }, discretionary: { expiryDate: expiredYesterday } },
			false),
		createTeamspace(
			teamspaces.teamspaceExpiringToday.user,
			[users[0].user],
			{ internal: { expiryDate: expiryToday }, discretionary: { expiryDate: expiredYesterday } },
			false),
		createTeamspace(
			teamspaces.teamspaceExpiringIn30DaysMultipleAdmins.user,
			users.map(({ user }) => user),
			{ internal: { expiryDate: expiryWithinThreshold }, discretionary: { expiryDate: expiredYesterday } },
			false),
		createTeamspace(
			teamspaces.teamspaceExpiringTodayMultipleAdmins.user,
			users.map(({ user }) => user),
			{ internal: { expiryDate: expiryToday }, discretionary: { expiryDate: expiredYesterday } },
			false),
		createTeamspace(
			teamspaces.teamspaceNotExpiring.user,
			users.map(({ user }) => user),
			{ internal: { expiryDate: null }, discretionary: { expiryDate: expiredYesterday } },
			false),
	]);
};

const createData = () => ({
	teamspaceWithMultipleExpiringSubscriptions: generateUserCredentials(),
	teamspaceExpiringIn30Days: generateUserCredentials(),
	teamspaceExpiringToday: generateUserCredentials(),
	teamspaceExpiringIn30DaysMultipleAdmins: generateUserCredentials(),
	teamspaceExpiringTodayMultipleAdmins: generateUserCredentials(),
	teamspaceNotExpiring: generateUserCredentials(),
	users: times(5, () => {
		const user = generateUserCredentials();
		return { ...user, userId: user.user };
	}),
});

const updateExpiryDate = async (teamspace, expiryDate, subscriptionList) => {
	await Promise.all(
		subscriptionList.map((subscription) => editSubscriptions(
			teamspace,
			subscription,
			{ expiryDate },
		)),
	);
};

const runTest = () => {
	describe('Check Teamspace Expiry', () => {
		const testData = createData();
		beforeAll(async () => {
			await resetDB();
			await setupData(testData);
		});

		test('sends appropriate emails to appropriate users', async () => {
			await checkTeamspaceExpiry.run('external');
			// 2 teamspaces with all the users plus 3 teamspaces with single admin
			const numberOfCalls = testData.users.length * 2 + 3;

			const callsWithExpiringSoonTemplate = sendEmail.mock.calls.filter(
				(call) => call[0] === emailTemplates.TEAMSPACE_EXPIRING_SOON.name,
			);
			const callsWithExpiringTodayTemplate = sendEmail.mock.calls.filter(
				(call) => call[0] === emailTemplates.TEAMSPACE_EXPIRING_TODAY.name,
			);
			// 5 users from multiple admins plus user[0] from single admin
			expect(callsWithExpiringSoonTemplate.length).toBe(7);
			// 5 users from from multiple admins plus user[0] from single admin and multiple subscriptions
			expect(callsWithExpiringTodayTemplate.length).toBe(6);

			expect(sendEmail).toHaveBeenCalledTimes(numberOfCalls);
			testData.users.forEach(({ user, basicData: { email } }) => {
				if (user === testData.users[0].user) {
					expect(sendEmail).toHaveBeenCalledWith(
						emailTemplates.TEAMSPACE_EXPIRING_SOON.name,
						email,
						expect.any(Object),
					);
					expect(sendEmail).toHaveBeenCalledWith(
						emailTemplates.TEAMSPACE_EXPIRING_TODAY.name,
						email,
						expect.any(Object),
					);
				} else {
					expect(sendEmail).toHaveBeenCalledWith(
						emailTemplates.TEAMSPACE_EXPIRING_SOON.name,
						email,
						expect.any(Object),
					);
				}
			});
		});
		test('sends an internal digest email', async () => {
			await checkTeamspaceExpiry.run('internal');
			expect(sendEmail).toHaveBeenCalledTimes(1);
			expect(sendEmail).toHaveBeenCalledWith(
				emailTemplates.TEAMSPACE_EXPIRY_DIGEST.name,
				config.contact.support,
				expect.any(Object),
			);
		});

		test('does not send emails when no teamspaces are expiring within the threshold', async () => {
			const currentDate = new Date();
			const expiryOutOfThreshold = new Date();
			expiryOutOfThreshold.setDate(currentDate.getDate() + 45);
			await Promise.all(
				[
					testData.teamspaceWithMultipleExpiringSubscriptions.user,
					testData.teamspaceExpiringIn30Days.user,
					testData.teamspaceExpiringIn30DaysMultipleAdmins.user,
					testData.teamspaceExpiringToday.user,
					testData.teamspaceExpiringTodayMultipleAdmins.user,
				].map((teamspace) => updateExpiryDate(
					teamspace,
					expiryOutOfThreshold,
					teamspace === testData.teamspaceWithMultipleExpiringSubscriptions.user
						? ['internal', 'pilot', 'discretionary', 'enterprise']
						: ['internal'],
				)),
			);
			await checkTeamspaceExpiry.run('internal');
			expect(sendEmail).not.toHaveBeenCalled();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
