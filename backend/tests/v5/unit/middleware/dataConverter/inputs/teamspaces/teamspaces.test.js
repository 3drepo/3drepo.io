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

const { src } = require('../../../../../helper/path');

jest.mock('../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
jest.mock('../../../../../../../src/v5/utils/permissions/permissions');
const { templates } = require(`${src}/utils/responseCodes`);
jest.mock('../../../../../../../src/v5/models/fileRefs');
const FileRefsModel = require(`${src}/models/fileRefs`);
const Teamspaces = require(`${src}/middleware/dataConverter/inputs/teamspaces`);
const { generateRandomString } = require('../../../../../helper/services');
const { AVATARS_COL_NAME } = require('../../../../../../../src/v5/models/fileRefs.constants');

Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testTeamspaceHasAvatar = () => {
	describe('Test if teamspace has avatar', () => {
		test(`should respond with ${templates.avatarNotFound.code} if no avatar is found`, async () => {
			const teamspace = generateRandomString();
			const getRefEntryMock = FileRefsModel.getRefEntry.mockResolvedValueOnce(undefined);
			const mockCB = jest.fn();
			await Teamspaces.teamspaceHasAvatar({ params: { teamspace } }, {}, mockCB);
			expect(getRefEntryMock).toHaveBeenCalledTimes(1);
			expect(getRefEntryMock).toHaveBeenCalledWith('admin', AVATARS_COL_NAME, teamspace);
			expect(mockCB).toHaveBeenCalledTimes(0);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.avatarNotFound.code);
		});

		test('should call next() if avatar is found', async () => {
			const teamspace = generateRandomString();
			const getRefEntryMock = FileRefsModel.getRefEntry.mockResolvedValueOnce({ _id: generateRandomString() });
			const mockCB = jest.fn();
			await Teamspaces.teamspaceHasAvatar({ params: { teamspace } }, {}, mockCB);
			expect(getRefEntryMock).toHaveBeenCalledTimes(1);
			expect(getRefEntryMock).toHaveBeenCalledWith('admin', AVATARS_COL_NAME, teamspace);
			expect(mockCB).toHaveBeenCalledTimes(1);
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces', () => {
	testTeamspaceHasAvatar();
});
