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
const { generateRevisionEntry } = require('../../../../../../../../helper/services');

jest.mock('../../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);
const { cloneDeep } = require(`${src}/utils/helper/objects`);
const { templates } = require(`${src}/utils/responseCodes`);

const RevisionOutputMiddlewares = require(`${src}/middleware/dataConverter/outputs/teamspaces/projects/models/commons/revisions`);

// Mock respond function to just return the resCode
const respondFn = Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testSerialiseRevisionArray = () => {
	const noTS = generateRevisionEntry();
	delete noTS.timestamp;
	describe.each([
		[[], 'empty array'],
		[
			[
				generateRevisionEntry(),
				generateRevisionEntry(true),
				noTS,
			],
			'3 different rev types',
		],
	])('Serialise revision array data', (data, desc) => {
		test(`should serialise correctly with ${desc}`,
			() => {
				const nextIdx = respondFn.mock.calls.length;
				RevisionOutputMiddlewares.serialiseRevisionArray({ outputData: cloneDeep(data) }, {}, () => {});
				expect(respondFn.mock.calls.length).toBe(nextIdx + 1);
				expect(respondFn.mock.calls[nextIdx][2]).toEqual(templates.ok);

				const serialisedRevs = data.map((rev) => {
					const res = { ...rev };

					res._id = UUIDToString(rev._id);
					if (res.timestamp) res.timestamp = rev.timestamp.getTime();

					return res;
				});

				expect(respondFn.mock.calls[nextIdx][3]).toEqual({ revisions: serialisedRevs });
			});
	});
};

const testSerialiseRevision = () => {
	const noTs = generateRevisionEntry();
	delete noTs.timestamp;
	describe.each([
		[{}, 'no revision'],
		[noTs, 'no timestamp revision'],
		[generateRevisionEntry(), 'regual revision'],
	])('Serialize revision data', (data, desc) => {
		test(`should serialise correctly with ${desc}`, () => {
			const nextIdx = respondFn.mock.calls.length;
			RevisionOutputMiddlewares.serialiseRevision({ outputData: cloneDeep(data) }, {}, () => {});

			expect(respondFn.mock.calls.length).toBe(nextIdx + 1);
			expect(respondFn.mock.calls[nextIdx][2]).toEqual(templates.ok);

			const serialisedRev = {
				...data,
				_id: UUIDToString(data._id),
				timestamp: data.timestamp ? data.timestamp.getTime() : data.timestamp,
			};

			expect(respondFn.mock.calls[nextIdx][3]).toEqual(serialisedRev);
		});
	});
};

describe('middleware/dataConverter/outputs/teamspaces/projects/models/commons/revisions', () => {
	testSerialiseRevisionArray();
	testSerialiseRevision();
});
