/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { src } = require('../../../../../../../../helper/path');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../../../src/v5/models/revisions');
const RevisionsModel = require(`${src}/models/revisions`);

const Revisions = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/commons/revisions`);
const { templates } = require(`${src}/utils/responseCodes`);

const { generateRandomString, determineTestGroup, generateUUID } = require('../../../../../../../../helper/services');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testValidateUpdateRevisionData = () => {
	describe('Check if req arguments for void status update are valid', () => {
		test('should respond with invalidArguments if there are no body arguments', async () => {
			const mockCB = jest.fn(() => {});
			await Revisions.validateUpdateRevisionData({ body: { } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('should respond with invalidArguments if there are more than one body arguments', async () => {
			const mockCB = jest.fn(() => {});
			await Revisions.validateUpdateRevisionData({ body: { void: false, invalidArg: 123 } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('should respond with invalidArguments if there is no body argument named void', async () => {
			const mockCB = jest.fn(() => {});
			await Revisions.validateUpdateRevisionData({ body: { invalidArg: false } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('should respond with invalidArguments if there is one body argument named void but not boolean', async () => {
			const mockCB = jest.fn(() => {});
			await Revisions.validateUpdateRevisionData({ body: { void: 123 } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('should respond with invalidArguments if body is not an object', async () => {
			const mockCB = jest.fn(() => {});
			await Revisions.validateUpdateRevisionData({ body: 1 }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		});

		test('next() should be called if there is only one body argument named void and it is boolean', async () => {
			const mockCB = jest.fn(() => {});
			await Revisions.validateUpdateRevisionData({ body: { void: false } }, {}, mockCB);
			expect(mockCB.mock.calls.length).toBe(1);
		});
	});
};

const revisionTestHelper = (queryVersion) => {
	[
		['revision does not exist', false, true, false],
		['revision exists', true, true, true],
		['revision is not provided and defaults are not allowed', false, false, null, false],
		['revision is not provided and defaults are allowed', true, false, true, true],
		['revision is not provided, defaults are allowed but there is no revision', false, false, false, true],
	].forEach(([desc, success, hasRevision, shouldResolve, allowDefault]) => {
		const teamspace = generateRandomString();
		const model = generateRandomString();
		const revision = generateRandomString();
		const revId = generateUUID();
		const modelType = modelTypes.DRAWING;
		test(`should ${success ? 'call next' : 'respond with an error'} if ${desc}`, async () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { teamspace, model }, query: {} };
			const res = {};
			if (hasRevision) {
				if (queryVersion) {
					req.query.revId = revision;
				} else {
					req.params.revision = revision;
				}

				if (shouldResolve !== null) {
					if (shouldResolve) {
						RevisionsModel.getRevisionByIdOrTag.mockResolvedValueOnce({ _id: revId });
					} else {
						RevisionsModel.getRevisionByIdOrTag.mockRejectedValueOnce(templates.revisionNotFound);
					}
				}
			} else if (shouldResolve !== null) {
				if (shouldResolve) {
					RevisionsModel.getLatestRevision.mockResolvedValueOnce({ _id: revId });
				} else {
					RevisionsModel.getLatestRevision.mockRejectedValueOnce(templates.revisionNotFound);
				}
			}

			const fn = queryVersion ? Revisions.verifyRevQueryParam : Revisions.revisionExists;
			if (allowDefault !== undefined) {
				await fn(modelType, allowDefault)(req, res, mockCB);
			} else {
				await fn(modelType)(req, res, mockCB);
			}

			if (success) {
				expect(mockCB).toHaveBeenCalledTimes(1);
				expect(Responder.respond).not.toHaveBeenCalled();
				expect(req.params.revision).toEqual(revId);
			} else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.revisionNotFound);
			}

			if (shouldResolve === null) {
				expect(RevisionsModel.getRevisionByIdOrTag).not.toHaveBeenCalled();
				expect(RevisionsModel.getLatestRevision).not.toHaveBeenCalled();
			} else if (hasRevision) {
				expect(RevisionsModel.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
				expect(RevisionsModel.getRevisionByIdOrTag).toHaveBeenCalledWith(
					teamspace, model, modelType, revision, { _id: 1 });
				expect(RevisionsModel.getLatestRevision).not.toHaveBeenCalled();
			} else {
				expect(RevisionsModel.getLatestRevision).toHaveBeenCalledTimes(1);
				expect(RevisionsModel.getLatestRevision).toHaveBeenCalledWith(teamspace, model, modelType, { _id: 1 });
				expect(RevisionsModel.getRevisionByIdOrTag).not.toHaveBeenCalled();
			}
		});
	});
};

const testRevisionExists = () => {
	describe('Check if a revision exists', () => {
		revisionTestHelper();
	});
};

const testVerifyRevQueryParam = () => {
	describe('Verify rev query param', () => {
		revisionTestHelper(true);
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateUpdateRevisionData();
	testRevisionExists();
	testVerifyRevQueryParam();
});
