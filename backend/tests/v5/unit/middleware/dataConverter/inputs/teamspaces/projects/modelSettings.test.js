const { src } = require('../../../../../../helper/path');

jest.mock('../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
jest.mock('../../../../../../../../src/v5/utils/permissions/permissions');
const ModelSettings = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/modelSettings`);
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateUpdateSettingsData = () => {
	describe.each([
		[{ body: { name: 1 } }, false],
		[{ body: { name: null } }, false],		
		[{ body: { name: "valid" } }, true],
		[{ body: { desc: 1 } }, false],
		[{ body: { desc: null } }, false],
		[{ body: { desc: "valid" } }, true],
		[{ body: { surveyPoints: "invalid" } }, false],
		[{ body: { surveyPoints: null } }, false],
		[{ body: { surveyPoints: [{position: [1,2,3]}] } }, false],
		[{ body: { surveyPoints: [{latLong: [1,2]}] } }, false],
		[{ body: { surveyPoints: [{position: [1,2,3,4], latLong: [1,2]}] } }, false],
		[{ body: { surveyPoints: [{position: [1,2,3], latLong: [1,2,3]}] } }, false],
		[{ body: { surveyPoints: [{position: [1,2,3], latLong: [1,2]}] } }, true],
		[{ body: { angleFromNorth: "invalid" }} , false],
		[{ body: { angleFromNorth: null }} , false],
		[{ body: { angleFromNorth: 123 }} , true],
		[{ body: { unit: "invalid" } }, false],
		[{ body: { unit: 1 } }, false],
		[{ body: { unit: null } }, false],
		[{ body: { unit: 'mm' } }, true],
		[{ body: { code: 1 } }, false],
		[{ body: { code: "" } }, false],
		[{ body: { code: "CODE1!" } }, false],		
		[{ body: { code: null } }, false],
		[{ body: { code: "CODE1" } }, true],
		[{ body: { defaultView: 123 } }, false],
		[{ body: { defaultView: "invalid" } }, false],
		[{ body: { defaultView: null } }, false],
		[{ body: { defaultView: "9c7a6c50-ee85-11e8-af42-09344c707317" } }, true],
		[{ body: { defaultLegend: 123 } }, false],		
		[{ body: { defaultLegend: null } }, false],
		[{ body: { defaultLegend: "valid" } }, true],
		[{ body: 1 }, false],
		[{ }, false],
	])('Check if req arguments for settings update are valid', (data, shouldPass) => {
		test('should respond with invalidArguments if there arguments are not valid', async () => {
			const mockCB = jest.fn(() => {});
			const req = cloneDeep(data);
			await ModelSettings.validateUpdateSettingsData(req, {}, mockCB);
			if (shouldPass) {
				expect(mockCB.mock.calls.length).toBe(1);				
			} else {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			}
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects/modelSettings', () => {
	testValidateUpdateSettingsData();
});