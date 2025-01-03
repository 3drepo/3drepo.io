/**
 *  Copyright (C) 2024 3D Repo Ltd
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
	resetFileshare,
	db: { reset: resetDB, createTeamspace, createUser,
		createProject, createModel, createTemplates, createTicket },
	generateRandomString,
	generateUserCredentials,
	generateUUID, generateUUIDString,
	generateTemplate, generateTicket,
} = require('../../helper/services');

const { src, utilScripts } = require('../../helper/path');

const { ADD_ONS } = require(`${src}/models/teamspaces.constants`);
const { insertTicketAssignedNotifications } = require(`${src}/models/notifications`);
const { stringToUUID } = require(`${src}/utils/helper/uuids`);
const { templates: emailTemplates } = require(`${src}/services/mailer/mailer.constants`);

const SendDailyDigests = require(`${utilScripts}/teamspaces/sendDailyDigest`);

jest.mock('../../../../src/v5/services/mailer');
const mailer = require(`${src}/services/mailer`);

const { disconnect } = require(`${src}/handler/db`);

const setupData = async ({ users, ...teamspaces }) => {
	await Promise.all([...users, ...Object.values(teamspaces)].map((entry) => createUser(entry)));

	const usernameArr = users.map(({ user }) => user);

	const { teamspaceNoNotifications, ...teamspacesWithDigests } = teamspaces;
	const { teamspaceNoDigest, ...otherTeamspaces } = teamspacesWithDigests;

	await Promise.all([
		createTeamspace(teamspaceNoDigest.user, usernameArr, undefined, false),
		createTeamspace(teamspaceNoNotifications.user, usernameArr, undefined, false, { [ADD_ONS.DAILY_DIGEST]: true }),
		...Object.values(otherTeamspaces).map((ts) => createTeamspace(
			ts.user, usernameArr, undefined, false, { [ADD_ONS.DAILY_DIGEST]: true })),
	]);

	await Promise.all(Object.values(teamspacesWithDigests).map(async (ts) => {
		const project = generateUUID();
		const model = generateUUIDString();
		const template = generateTemplate();
		const ticket = generateTicket(template, true);

		await Promise.all([
			ts.user === teamspaces.teamspaceProjNotFound.user ? Promise.resolve()
				: createProject(ts.user, project, generateRandomString(), [model]),
			createModel(ts.user, model, generateRandomString()),
			ts.user === teamspaces.teamspaceNoTemplate.user ? Promise.resolve() : createTemplates(ts.user, [template]),
			createTicket(ts.user, project, model, ticket),
			insertTicketAssignedNotifications(ts.user, project, model, [{
				users: ts.user === teamspaces.teamspaceUserNotFound.user ? [generateRandomString()] : usernameArr,
				ticket: stringToUUID(ticket._id),
				assignedBy: usernameArr[0] }]),
		]);
	}));
};

const createData = () => ({
	teamspaceNoDigest: generateUserCredentials(),
	teamspaceNoNotifications: generateUserCredentials(),
	teamspace: generateUserCredentials(),
	teamspaceNoTemplate: generateUserCredentials(),
	teamspaceUserNotFound: generateUserCredentials(),
	teamspaceProjNotFound: generateUserCredentials(),
	users: times(5, generateUserCredentials),
});

const runTest = () => {
	const testData = createData();
	beforeAll(async () => {
		resetFileshare();
		await resetDB();
		await setupData(testData);
	});

	const testCases = [
		['should not send email if the teamspace does not have the addOn enabled', testData.teamspaceNoDigest.user],
		['should not send email if the teamspace does not have any notifications', testData.teamspaceNoNotifications.user],
		['should not send email if the teamspace does not have the matching template', testData.teamspaceNoTemplate.user],
		['should not send email if the user does not exist', testData.teamspaceUserNotFound.user],
		['should not send email if the project does not exist', testData.teamspaceProjNotFound.user],
		['should send email if the teamspace has notifications', testData.teamspace.user, true],
		['should work if teamspace is not specified', undefined, true],
	];

	describe.each(testCases)('Send daily digests ', (desc, teamspace, sendMail) => {
		test(desc, async () => {
			await SendDailyDigests.run(teamspace);
			if (sendMail) {
				expect(mailer.sendEmail).toHaveBeenCalledTimes(testData.users.length);
				testData.users.forEach(({ basicData: { email } }) => {
					expect(mailer.sendEmail).toHaveBeenCalledWith(
						emailTemplates.DAILY_DIGEST.name, email, expect.any(Object));
				});
			} else {
				expect(mailer.sendEmail).not.toHaveBeenCalled();
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	runTest();
	afterAll(disconnect);
});
