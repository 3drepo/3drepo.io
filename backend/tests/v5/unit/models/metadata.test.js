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

const { times } = require('lodash');

const { src } = require('../../helper/path');

const { determineTestGroup, generateUUID, generateRandomString, generateRandomObject } = require('../../helper/services');

jest.mock('../../../../src/v5/models/metadata.rules');
const RulesModel = require(`${src}/models/metadata.rules`);

const Metadata = require(`${src}/models/metadata`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const testGetMetadataById = () => {
	describe('Get metadata by Id', () => {
		test('should return error if the metadata does not exist', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			const metadataId = generateRandomString();
			jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			await expect(Metadata.getMetadataById(teamspace, model, metadataId))
				.rejects.toEqual(templates.metadataNotFound);
		});

		test('should return the metadata if they exists', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			const metadataId = generateRandomString();
			const expectedData = [{ key: generateRandomString(), value: generateRandomString() }];
			const projection = { _id: 1 };
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(expectedData);
			const res = await Metadata.getMetadataById(teamspace, model, metadataId, { _id: 1 });
			expect(res).toEqual(expectedData);
			expect(fn).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId }, projection);
			expect(fn).toHaveBeenCalledTimes(1);
		});
	});
};

const testUpdateCustomMetadata = () => {
	describe('Update Metadata', () => {
		test('should return error if metadata dont not exist', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			const metadataId = generateRandomString();
			const metadataToAdd = [{ key: generateRandomString(), value: generateRandomString() }];
			jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			await expect(Metadata.updateCustomMetadata(teamspace, model, metadataId, metadataToAdd))
				.rejects.toEqual(templates.metadataNotFound);
		});

		test('should add metadata', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			const metadataId = generateRandomString();
			const metadataToAdd = [{ key: generateRandomString(), value: generateRandomString() }];
			const fn1 = jest.spyOn(db, 'findOne').mockResolvedValueOnce({ metadata: [] });
			const fn2 = jest.spyOn(db, 'updateOne').mockImplementationOnce(() => { });
			await Metadata.updateCustomMetadata(teamspace, model, metadataId, metadataToAdd);

			expect(fn1).toHaveBeenCalledTimes(1);
			expect(fn1).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId }, { metadata: 1 });
			expect(fn2).toHaveBeenCalledTimes(1);
			expect(fn2).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId },
				{ $set: { metadata: metadataToAdd.map((um) => ({ ...um, custom: true })) } });
		});

		test('should do nothing if new metadata has null value and the existing metadata does not contain such value', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			const metadataId = generateRandomString();
			const metadataToAdd = [{ key: generateRandomString(), value: null }];
			const fn1 = jest.spyOn(db, 'findOne').mockResolvedValueOnce({ metadata: [] });
			const fn2 = jest.spyOn(db, 'updateOne').mockImplementationOnce(() => { });
			await Metadata.updateCustomMetadata(teamspace, model, metadataId, metadataToAdd);

			expect(fn1).toHaveBeenCalledTimes(1);
			expect(fn1).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId }, { metadata: 1 });
			expect(fn2).toHaveBeenCalledTimes(1);
			expect(fn2).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId },
				{ $set: { metadata: [] } });
		});

		test('should update existing metadata', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			const metadataId = generateRandomString();
			const existingMetadata = [{ key: generateRandomString(), value: generateRandomString() }];
			const changeSet = existingMetadata.map((em) => ({ ...em, value: generateRandomString() }));
			const fn1 = jest.spyOn(db, 'findOne').mockResolvedValueOnce({ metadata: existingMetadata });
			const fn2 = jest.spyOn(db, 'updateOne').mockImplementationOnce(() => { });
			await Metadata.updateCustomMetadata(teamspace, model, metadataId, changeSet);

			expect(fn1).toHaveBeenCalledTimes(1);
			expect(fn1).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId }, { metadata: 1 });
			expect(fn2).toHaveBeenCalledTimes(1);
			expect(fn2).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId },
				{ $set: { metadata: changeSet } });
		});

		test('should remove existing metadata', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			const metadataId = generateRandomString();
			const existingMetadata = [
				{ key: generateRandomString(), value: generateRandomString() },
				{ key: generateRandomString(), value: generateRandomString() },
			];
			const metadataToRemove = existingMetadata.map((em) => ({ ...em, value: null }));
			const fn1 = jest.spyOn(db, 'findOne').mockResolvedValueOnce({ metadata: existingMetadata });
			const fn2 = jest.spyOn(db, 'updateOne').mockImplementationOnce(() => { });
			await Metadata.updateCustomMetadata(teamspace, model, metadataId, metadataToRemove);

			expect(fn1).toHaveBeenCalledTimes(1);
			expect(fn1).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId }, { metadata: 1 });
			expect(fn2).toHaveBeenCalledTimes(1);
			expect(fn2).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId },
				{ $set: { metadata: [] } });
		});

		test('should add, remove and update metadata', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			const metadataId = generateRandomString();
			const existingMetadata = [
				{ key: generateRandomString(), value: generateRandomString() },
				{ key: generateRandomString(), value: generateRandomString() },
			];

			const metadataToAdd = { key: generateRandomString(), value: generateRandomString() };
			const metadataToUpdate = { key: existingMetadata[0].key, value: generateRandomString() };
			const changeSet = [
				metadataToAdd,
				metadataToUpdate,
				{ key: existingMetadata[1].key, value: null },
			];

			const fn1 = jest.spyOn(db, 'findOne').mockResolvedValueOnce({ metadata: existingMetadata });
			const fn2 = jest.spyOn(db, 'updateOne').mockImplementationOnce(() => { });
			await Metadata.updateCustomMetadata(teamspace, model, metadataId, changeSet);

			expect(fn1).toHaveBeenCalledTimes(1);
			expect(fn1).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId }, { metadata: 1 });
			expect(fn2).toHaveBeenCalledTimes(1);
			expect(fn2).toHaveBeenCalledWith(teamspace, `${model}.scene`, { _id: metadataId },
				{ $set: { metadata: [metadataToUpdate, { ...metadataToAdd, custom: true }] } });
		});
	});
};

const testGetMetadataByRules = () => {
	describe('Get metadata by rules', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const revId = generateRandomString();

		test('Should return all matching positive query results (no negative queries)', async () => {
			const rules = times(5, generateRandomObject);
			const posQueries = times(5, generateRandomObject);
			const expectedData = times(10, generateRandomObject);
			const projection = generateRandomObject();

			RulesModel.generateQueriesFromRules.mockReturnValueOnce({ positives: posQueries, negatives: [] });

			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedData);

			await expect(Metadata.getMetadataByRules(teamspace, project, model, revId, rules, projection))
				.resolves.toEqual(expectedData);

			expect(RulesModel.generateQueriesFromRules).toHaveBeenCalledTimes(1);
			expect(RulesModel.generateQueriesFromRules).toHaveBeenCalledWith(rules);

			const expectedPosQuery = { $and: [{ rev_id: revId, type: 'meta' }, ...posQueries] };

			expect(findFn).toHaveBeenCalledTimes(1);
			expect(findFn).toHaveBeenCalledWith(teamspace, `${model}.scene`, expectedPosQuery, projection);
		});

		test('Should filter away any items that matches negative queries from the positive results', async () => {
			const rules = times(5, generateRandomObject);
			const posQueries = times(5, generateRandomObject);
			const negQueries = times(5, generateRandomObject);
			const projection = generateRandomObject();

			const positiveRes = times(10, () => ({ ...generateRandomObject(), _id: generateUUID() }));
			const negativeRes = [];

			const expectedData = [];

			positiveRes.forEach((entry, i) => {
				if (i % 3) {
					expectedData.push(entry);
				} else {
					negativeRes.push(entry);
				}
			});

			RulesModel.generateQueriesFromRules.mockReturnValueOnce({ positives: posQueries, negatives: negQueries });

			const findFn = jest.spyOn(db, 'find').mockResolvedValueOnce(positiveRes);
			jest.spyOn(db, 'find').mockResolvedValueOnce(negativeRes);

			await expect(Metadata.getMetadataByRules(teamspace, project, model, revId, rules, projection))
				.resolves.toEqual(expectedData);

			expect(RulesModel.generateQueriesFromRules).toHaveBeenCalledTimes(1);
			expect(RulesModel.generateQueriesFromRules).toHaveBeenCalledWith(rules);

			const expectedPosQuery = { $and: [{ rev_id: revId, type: 'meta' }, ...posQueries] };
			const expectedNegQuery = { $or: negQueries };

			expect(findFn).toHaveBeenCalledTimes(2);
			expect(findFn).toHaveBeenCalledWith(teamspace, `${model}.scene`, expectedPosQuery, projection);
			expect(findFn).toHaveBeenCalledWith(teamspace, `${model}.scene`, expectedNegQuery, { _id: 1 });
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetMetadataById();
	testUpdateCustomMetadata();
	testGetMetadataByRules();
});
