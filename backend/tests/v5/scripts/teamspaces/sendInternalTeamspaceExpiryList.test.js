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

const {editSubscriptions} = require(`${src}/models/teamspaceSettings`);

jest.mock('../../../../src/v5/services/mailer');
const mailer = require(`${src}/services/mailer`);

const { disconnect } = require(`${src}/handler/db`);

const setupData = async ({ users, ...teamspaces }) => {
	await Promise.all([
		...users,
		teamspaces.teamspaceExpiringIn30Days,
		teamspaces.teamspaceExpiringIn30DaysMultipleAdmins,
		teamspaces.teamspaceNotExpiring].map((entry) => createUser(entry)));

	await Promise.all([
		createTeamspace(
			teamspaces.teamspaceExpiringIn30Days.user,
			[users[0].user],
			undefined,
			false),
		createTeamspace(
			teamspaces.teamspaceExpiringIn30DaysMultipleAdmins.user,
			users.map(({ user }) => user),
			undefined,
			false),
		createTeamspace(
			teamspaces.teamspaceNotExpiring.user,
			users.map(({ user }) => user),
			undefined,
			false),
	]);

	await Promise.all(users.map(({ user }) => User.updateUserId(user, user)));
};

const updateExpiryDate = async (teamspace, expiryDate) => {
	await editSubscriptions(teamspace, 'internal', { expiryDate });
}

const createData = () => ({
	teamspaceExpiringIn30Days: generateUserCredentials(),
	teamspaceExpiringIn30DaysMultipleAdmins: generateUserCredentials(),
	teamspaceNotExpiring: generateUserCredentials(),
	users: times(5, generateUserCredentials),
});

const runTest = () => {
	const testData = createData();
	const currentDate = new Date();
	const expiryWithinThreshold = new Date();
	expiryWithinThreshold.setDate(currentDate.getDate() + 15);
	const expiryOutOfThreshold = new Date();
	expiryOutOfThreshold.setDate(currentDate.getDate() + 45);

	beforeAll(async () => {
		await resetDB();
		await setupData(testData);
	});

	it('sends appropriate emails to appropriate users', async () => {
		await Promise.all(
			[
				testData.teamspaceExpiringIn30Days.user, 
				testData.teamspaceExpiringIn30DaysMultipleAdmins.user
			].map(( teamspace ) => updateExpiryDate(teamspace, expiryWithinThreshold)));
		await SendInternalTeamspaceExpiryList.run();
		expect(mailer.sendEmail).toHaveBeenCalledTimes(1);
		expect(mailer.sendEmail).toHaveBeenCalledWith(
			emailTemplates.INTERNAL_TEAMSPACE_EXPIRY_LIST.name,
			config.mail.sender,
			expect.any(Object),
		);
	});
	
	it('does not send emails when no teamspaces are expiring within the threshold', async () => {
		await Promise.all(
			[
				testData.teamspaceExpiringIn30Days.user, 
				testData.teamspaceExpiringIn30DaysMultipleAdmins.user
			].map(( teamspace ) => updateExpiryDate(teamspace, expiryOutOfThreshold)));
		await SendInternalTeamspaceExpiryList.run();
		expect(mailer.sendEmail).not.toHaveBeenCalled();
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
