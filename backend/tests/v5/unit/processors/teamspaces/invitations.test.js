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

const { src, srcV4 } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');

jest.mock('../../../../../src/v4/models/invitations');
const InvitationsModelV4 = require(`${srcV4}/models/invitations`);

jest.mock('../../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);

const Invitations = require(`${src}/processors/teamspaces/invitations`);

const testUnpack = () => {
	describe('Unpack Invitations', () => {
		test('should call unpack methos of v4 invitations model', async () => {
			const username = generateRandomString();
			const user = generateRandomString();

			UsersModel.getUserByUsername.mockResolvedValueOnce(user);
			InvitationsModelV4.unpack.mockResolvedValueOnce(undefined);

			await Invitations.unpack(username);

			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(1);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(username);
			expect(InvitationsModelV4.unpack).toHaveBeenCalledTimes(1);
			expect(InvitationsModelV4.unpack).toHaveBeenCalledWith(user);
		});

		test('should catch error and do nothing if it failed', async () => {
			const username = generateRandomString();
			const user = generateRandomString();

			UsersModel.getUserByUsername.mockRejectedValueOnce(user);

			await Invitations.unpack(username);

			expect(UsersModel.getUserByUsername).toHaveBeenCalledTimes(1);
			expect(UsersModel.getUserByUsername).toHaveBeenCalledWith(username);
			expect(InvitationsModelV4.unpack).not.toHaveBeenCalled();
		});
	});
};

describe('processors/teamspaces/invitations', () => {
	testUnpack();
});
