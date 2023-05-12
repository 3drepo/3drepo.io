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

const { src, image } = require('../../../../../../../../helper/path');

const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { determineTestGroup, generateRandomString, generateUUID } = require('../../../../../../../../helper/services');
const FS = require('fs');
const { UUIDToString } = require('../../../../../../../../../../src/v5/utils/helper/uuids');

jest.mock('../../../../../../../../../../src/v5/models/tickets.groups');
const TicketGroups = require(`${src}/models/tickets.groups`);

jest.mock('../../../../../../../../../../src/v5/models/tickets');
const Tickets = require(`${src}/models/tickets`);

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const Groups = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets.groups`);
const { templates } = require(`${src}/utils/responseCodes`);

const genParams = {
	teamspace: generateRandomString(),
	project: generateRandomString(),
	model: generateRandomString(),
	ticket: generateRandomString(),
	group: generateRandomString(),
};

const testValidateUpdateGroup = () => {
	describe('Validate update group', () => {
		test(`Should fail with ${templates.groupNotFound.code} if the group does not exist`, async () => {
			TicketGroups.getGroupById.mockRejectedValueOnce(templates.groupNotFound);

			const req = { params: genParams };
			const res = {};
			const next = jest.fn();

			await Groups.validateUpdateGroup(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.groupNotFound);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateUpdateGroup();
});
