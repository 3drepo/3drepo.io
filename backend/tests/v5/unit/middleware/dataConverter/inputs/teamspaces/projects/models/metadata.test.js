
const { src } = require('../../../../../../../helper/path');
const { generateRandomString } = require('../../../../../../../helper/services');
const { templates } = require(`${src}/utils/responseCodes`);

const Metadata = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/metadata`);

jest.mock('../../../../../../../../../src/v5/models/metadata');
const MetadataModel = require(`${src}/models/metadata`);

jest.mock('../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const metadata = [
	{ key: generateRandomString(), value: generateRandomString() },
	{ key: generateRandomString(), value: generateRandomString(), custom: true },
	{ key: generateRandomString(), value: generateRandomString(), custom: true },
];
const nonCustomMetadata = metadata[0].key;
const customMetadata = metadata[1].key;
const customMetadata2 = metadata[2].key;

MetadataModel.getMetadataById.mockImplementation(() => ({ metadata }));
// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateUpdateMetadata = () => {
	const standardReq = { params: { teamspace: generateRandomString(), project: generateRandomString(), container: generateRandomString() }}
	describe.each([
		['Editing non custom metadata', { ...standardReq, body: { metadata: [ { key: nonCustomMetadata, value: generateRandomString() } ] } }, false],
		['Deleting non custom metadata', {...standardReq, body: { metadata: [ { key: nonCustomMetadata, value: null } ] } }, false],
		['Editing custom metadata', {...standardReq, body: { metadata: [ { key: customMetadata, value: generateRandomString() } ] } }, true],
		['Adding, removing and editing custom metadata', {...standardReq, body: { metadata: [
			{ key: customMetadata, value: null },
			{ key: customMetadata2, value: generateRandomString() },
			{ key: generateRandomString(), value: generateRandomString() } ] } }, true],
		['Deleting custom metadata', {...standardReq, body: { metadata: [ { key: customMetadata, value: null } ] } }, true],
		['Adding custom metadata', {...standardReq, body: { metadata: [ { key: generateRandomString(), value: generateRandomString() } ] } }, true],
		['With extra properties', {...standardReq, body: { metadata: [ { key: generateRandomString(), value: generateRandomString() } ], extra: 1 } }, false],
		['With empty body', {...standardReq, body: { } }, false],
		['With undefined body', {...standardReq, body: undefined }, false],
	])('Can delete container', (desc, req, success) => {
		test(`${desc} ${success ? 'should call next()' : 'should respond with invalidArguments}'}`, async () => {
			const mockCB = jest.fn();
			await Metadata.validateUpdateMetadata(req, {}, mockCB);

			if (success) {
				expect(mockCB.mock.calls.length).toBe(1);
			} else {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			}
		});
	});
};


describe('middleware/dataConverter/inputs/teamspaces/projects/models/metadata', () => {
	testValidateUpdateMetadata();
});
