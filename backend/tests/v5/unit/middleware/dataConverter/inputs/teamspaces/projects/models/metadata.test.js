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

const { src } = require('../../../../../../../helper/path');
const { generateRandomString } = require('../../../../../../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);

const Metadata = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/metadata`);

jest.mock('../../../../../../../../../src/v5/models/metadata');
const MetadataModel = require(`${src}/models/metadata`);

jest.mock('../../../../../../../../../src/v5/models/modelSettings');

jest.mock('../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const metadata = [
	{ key: generateRandomString(), value: generateRandomString() },
	{ key: generateRandomString(), value: generateRandomString(), custom: true },
	{ key: generateRandomString(), value: generateRandomString(), custom: true },
];

const existingMetadataId = generateRandomString();
const nonCustomMetadata = metadata[0];
const customMetadata = metadata[1];
const customMetadata2 = metadata[2];

MetadataModel.getMetadataById.mockImplementation((teamspace, container, metadataId) => {
	if (metadataId === existingMetadataId) {
		return { metadata };
	}

	throw templates.metadataNotFound;
});

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateUpdateMetadata = () => {
	const standardReq = { params: { teamspace: generateRandomString(),
		project: generateRandomString(),
		container: generateRandomString(),
		metadata: existingMetadataId } };
	describe.each([
		['Updating non existing metadata', { params: { ...standardReq.params, metadata: generateRandomString() },
			body: { metadata: [{ key: generateRandomString(), value: generateRandomString() }] } }, false,
		templates.metadataNotFound],
		['Updating non custom metadata', { ...standardReq, body: { metadata: [{ key: nonCustomMetadata.key, value: generateRandomString() }] } }, false],
		['Deleting non custom metadata', { ...standardReq, body: { metadata: [{ key: nonCustomMetadata.key, value: null }] } }, false],
		['Editing custom metadata', { ...standardReq, body: { metadata: [{ key: customMetadata.key, value: generateRandomString() }] } }, true],
		['Adding, removing and editing custom metadata', { ...standardReq,
			body: { metadata: [
				{ key: customMetadata.key, value: null },
				{ key: customMetadata2.key, value: generateRandomString() },
				{ key: generateRandomString(), value: generateRandomString() }] } }, true],
		['Deleting custom metadata', { ...standardReq, body: { metadata: [{ key: customMetadata.key, value: null }] } }, true],
		['Adding custom metadata', { ...standardReq, body: { metadata: [{ key: generateRandomString(), value: generateRandomString() }] } }, true],
		['With extra properties', { ...standardReq, body: { metadata: [{ key: generateRandomString(), value: generateRandomString() }], extra: 1 } }, false],
		['Without a key', { ...standardReq, body: { metadata: [{ value: generateRandomString() }] } }, false],
		['Without a value', { ...standardReq, body: { metadata: [{ key: generateRandomString() }] } }, false],
		['With empty body', { ...standardReq, body: { } }, false],
		['With undefined body', { ...standardReq, body: undefined }, false],
	])('Can update metadata', (desc, req, success, expectedError = templates.invalidArguments) => {
		test(`${desc} ${success ? 'should call next()' : `should respond with ${expectedError.code}}`}`, async () => {
			const mockCB = jest.fn();
			await Metadata.validateUpdateMetadata(req, {}, mockCB);

			if (success) {
				expect(mockCB.mock.calls.length).toBe(1);
			} else {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(expectedError.code);
			}
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects/models/metadata', () => {
	testValidateUpdateMetadata();
});
