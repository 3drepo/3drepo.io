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

const { templates: emailTemplates } = require(`${src}/services/mailer/mailer.constants`);

const config = require(`${src}/utils/config`);

const SendInternalTeamspaceExpiryList = require(`${utilScripts}/teamspaces/sendInternalTeamspaceExpiryList`);

const User = require(`${src}/models/users`);

jest.mock('../../../../src/v5/services/mailer');
const mailer = require(`${src}/services/mailer`);

const { disconnect } = require(`${src}/handler/db`);

const setupData = async ({ users, ...teamspaces }) => {
	const currentDate = new Date();
	const expiryThreshold = new Date();
	expiryThreshold.setDate(currentDate.getDate() + 30);
	const expiryWithinThreshold = new Date();
	expiryWithinThreshold.setDate(currentDate.getDate() + 15);
	const expiryToday = new Date();
	expiryToday.setHours(12, 0, 0, 0);

	await Promise.all([
		...users,
		teamspaces.teamspaceExpiringIn30Days,
		teamspaces.teamspaceExpiringIn30DaysMultipleAdmins,
		teamspaces.teamspaceNotExpiring].map((entry) => createUser(entry)));

	await Promise.all([
		createTeamspace(
			teamspaces.teamspaceExpiringIn30Days.user,
			[users[0].user],
			{ internal: { expiryDate: expiryWithinThreshold } },
			false),
		createTeamspace(
			teamspaces.teamspaceExpiringIn30DaysMultipleAdmins.user,
			users.map(({ user }) => user),
			{ internal: { expiryDate: expiryWithinThreshold } },
			false),
		createTeamspace(
			teamspaces.teamspaceNotExpiring.user,
			users.map(({ user }) => user),
			undefined,
			false),
	]);

	await Promise.all(users.map(({ user }) => User.updateUserId(user, user)));
};

const createData = () => ({
	teamspaceExpiringIn30Days: generateUserCredentials(),
	teamspaceExpiringIn30DaysMultipleAdmins: generateUserCredentials(),
	teamspaceNotExpiring: generateUserCredentials(),
	users: times(5, generateUserCredentials),
});

const runTest = () => {
	const testData = createData();
	beforeAll(async () => {
		await resetDB();
		await setupData(testData);
	});

	it('sends appropriate emails to appropriate users', async () => {
		await SendInternalTeamspaceExpiryList.run();
		expect(mailer.sendEmail).toHaveBeenCalledTimes(testData.users.length + 1); // send to all the users twice for the multiple admins and once for single admin

		expect(mailer.sendEmail).toHaveBeenCalledWith(
			emailTemplates.INTERNAL_TEAMSPACE_EXPIRY_LIST.name,
			config.mail.sender,
			expect.any(Object),
		);
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
