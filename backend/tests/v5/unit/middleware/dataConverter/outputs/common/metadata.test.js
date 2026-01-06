/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { determineTestGroup, generateRandomNumber, generateUUID, generateRandomString } = require('../../../../../helper/services');
const { src } = require('../../../../../helper/path');
const { times } = require('lodash');

const { UUIDToString } = require(`${src}/utils/helper/uuids`);
const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const Metadata = require(`${src}/middleware/dataConverter/outputs/common/metadata`);

const testFormatMetadata = () => {
	describe('Format metadata', () => {
		test(`Should respond with ${templates.unknown.code} if an error has been thrown`, () => {
			const req = { metadata: [{ _id: generateRandomNumber() }] };

			expect(Metadata.formatMetadata(req, {})).toBeUndefined();

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.unknown);
		});

		test('Should cast ids correctly', () => {
			const req = { metadata: times(10, () => ({
				_id: generateUUID(),
				parents: times(10, () => generateUUID()),
			})) };

			expect(Metadata.formatMetadata(req, {})).toBeUndefined();

			const output = req.metadata.map((meta) => ({
				_id: UUIDToString(meta._id),
				parents: meta.parents.map(UUIDToString),
			}));

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, output);
		});

		test('Should cast metadata correctly', () => {
			const req = { metadata: times(10, () => ({
				metadata: times(10, () => ({ key: generateRandomString(), value: generateRandomString() })),
			})) };

			expect(Metadata.formatMetadata(req, {})).toBeUndefined();

			const output = req.metadata.map((meta) => ({
				metadata: meta.metadata.reduce((acc, { key, value }) => {
					acc[key] = value;
					return acc;
				}, {}),
			}));

			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.ok, output);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testFormatMetadata();
});
