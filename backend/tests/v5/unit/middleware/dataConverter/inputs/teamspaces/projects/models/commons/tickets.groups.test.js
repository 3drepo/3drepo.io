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
const { determineTestGroup, generateRandomObject, generateRandomString, generateUUID } = require('../../../../../../../../helper/services');
const FS = require('fs');
const { UUIDToString } = require('../../../../../../../../../../src/v5/utils/helper/uuids');

jest.mock('../../../../../../../../../../src/v5/models/tickets.groups');
const TicketGroups = require(`${src}/models/tickets.groups`);

jest.mock('../../../../../../../../../../src/v5/schemas/tickets/tickets.groups');
const GroupsSchema = require(`${src}/schemas/tickets/tickets.groups`);

jest.mock('../../../../../../../../../../src/v5/models/tickets');
const Tickets = require(`${src}/models/tickets`);

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const Groups = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/tickets.groups`);
const { templates, createResponseCode } = require(`${src}/utils/responseCodes`);

const params = {
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

			const req = { params };
			const res = {};
			const next = jest.fn();

			await Groups.validateUpdateGroup(req, res, next);

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.groupNotFound);
		});

		test(`Should fail with ${templates.invalidArguments.code} if schema validation failed`, async () => {
			TicketGroups.getGroupById.mockResolvedValueOnce();
			const errMsg = generateRandomString();
			const validateFn = jest.fn().mockRejectedValueOnce(new Error(errMsg));
			GroupsSchema.schema.mockReturnValueOnce({ validate: validateFn });

			const req = { params, body: generateRandomObject() };
			const res = {};
			const next = jest.fn();

			await Groups.validateUpdateGroup(req, res, next);

			expect(validateFn).toHaveBeenCalledTimes(1);
			expect(validateFn).toHaveBeenCalledWith(req.body, { stripUnknown: true });

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, createResponseCode(templates.invalidArguments, errMsg));
		});

		test(`Should fail with ${templates.invalidArguments.code} if deserialisation failed`, async () => {
			TicketGroups.getGroupById.mockResolvedValueOnce();
			const errMsg = generateRandomString();
			const validateFn = jest.fn().mockResolvedValueOnce({});
			GroupsSchema.schema.mockReturnValueOnce({ validate: validateFn });
			GroupsSchema.deserialiseGroup.mockImplementationOnce(() => { throw new Error(errMsg); });

			const req = { params, body: generateRandomObject() };
			const res = {};
			const next = jest.fn();

			await Groups.validateUpdateGroup(req, res, next);

			expect(GroupsSchema.deserialiseGroup).toHaveBeenCalledTimes(1);
			expect(GroupsSchema.deserialiseGroup).toHaveBeenCalledWith(req.body, { stripUnknown: true });

			expect().toHaveBeenCalledTimes(1);
			expect(validateFn).toHaveBeenCalledWith(req.body, { stripUnknown: true });

			expect(next).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, createResponseCode(templates.invalidArguments, errMsg));
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateUpdateGroup();
});
