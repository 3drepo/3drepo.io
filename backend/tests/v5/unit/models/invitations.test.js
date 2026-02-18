/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { src } = require('../../helper/path');

const Invitations = require(`${src}/models/invitations`);
const db = require(`${src}/handler/db`);
const { generateRandomString, determineTestGroup } = require('../../helper/services');

const { DEFAULT_OWNER_JOB } = require(`${src}/models/jobs.constants`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

jest.mock('../../../../src/v5/services/sso/frontegg');
const FronteggMock = require(`${src}/services/sso/frontegg`);

jest.mock('../../../../src/v5/models/teamspaceSettings');
const TeamspaceSettingsMock = require(`${src}/models/teamspaceSettings`);

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManagerMock = require(`${src}/services/eventsManager/eventsManager`);

const testGetInvitationsByTeamspace = () => {
	describe('Get invitations by teamspace', () => {
		test('should get invitations by teamspace', async () => {
			const teamspace = generateRandomString();
			const invitations = [
				{ id: generateRandomString() },
				{ id: generateRandomString() },
			];
			const fn = jest.spyOn(db, 'find').mockImplementation(() => invitations);
			const res = await Invitations.getInvitationsByTeamspace(teamspace);
			expect(res).toEqual(invitations);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith('admin', 'invitations', { 'teamSpaces.teamspace': teamspace }, {}, undefined);
		});
	});
};

const testInit = () => {
	describe('Initialise Invitations', () => {
		test('Should create the desired index', async () => {
			const fn = jest.spyOn(db, 'createIndex').mockResolvedValueOnce();
			await expect(Invitations.initialise()).resolves.toBeUndefined();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith('admin', 'invitations', { 'teamSpaces.teamspace': 1 }, { runInBackground: true });
		});
	});
};

const testInviteUserAsAdmin = () => {
	describe('Invite user as admin', () => {
		test('Should invite user as admin', async () => {
			const teamspace = generateRandomString();
			const email = generateRandomString();
			const accountId = generateRandomString();

			TeamspaceSettingsMock.getTeamspaceRefId.mockResolvedValueOnce(accountId);
			const dbMock = jest.spyOn(db, 'insertOne').mockImplementation(() => {});

			await Invitations.inviteUserAsAdmin(teamspace, email);

			expect(FronteggMock.addUserToAccount).toHaveBeenCalledTimes(1);
			expect(FronteggMock.addUserToAccount).toHaveBeenCalledWith(accountId, email);

			expect(dbMock).toHaveBeenCalledTimes(1);
			expect(dbMock).toHaveBeenCalledWith('admin', 'invitations', {
				_id: email,
				teamSpaces: [{
					teamspace,
					job: DEFAULT_OWNER_JOB,
					permissions: { teamspace_admin: true },
				}],
			});

			expect(EventsManagerMock.publish).toHaveBeenCalledTimes(1);
			expect(EventsManagerMock.publish).toHaveBeenCalledWith(events.INVITATION_ADDED, {
				teamspace,
				email,
				job: DEFAULT_OWNER_JOB,
				permissions: { teamspace_admin: true },
			});
		});
	});
};

const testRemoveAllInvitationsByTeamspace = () => {
	describe('Remove all invitations by teamspace', () => {
		test('should remove all invitations by teamspace', async () => {
			const teamspace = generateRandomString();
			const fn = jest.spyOn(db, 'updateMany').mockImplementation(() => {});
			await Invitations.removeAllInvitationsByTeamspace(teamspace);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith('admin', 'invitations', { 'teamSpaces.teamspace': teamspace }, { $pull: { teamSpaces: { teamspace } } });
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetInvitationsByTeamspace();
	testInviteUserAsAdmin();
	testInit();
	testRemoveAllInvitationsByTeamspace();
});
