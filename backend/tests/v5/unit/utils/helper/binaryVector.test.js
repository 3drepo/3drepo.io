/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { Readable } = require('stream');
const { src } = require('../../../helper/path');

const { BinToVector3dStringStream } = require(`${src}/utils/helper/binaryVector`);
const ServiceHelper = require('../../../helper/services');

const testBinToJSONArrayVector3d = () => {
	const noVectors = 10;

	describe('Convert binary buffer of to JSON Array', () => {
		test('should convert binary vectors in the little endian format to a JSON Array', () => {
			const isLittleEndian = true;
			const { vectorArray, buffer } = ServiceHelper.generateRandomBinary3DVectorData(noVectors, isLittleEndian);
			const obj = new BinToVector3dStringStream({ isLittleEndian });

			const result = obj.binToJSONArrayVector3d(buffer, isLittleEndian);

			const parsed = JSON.parse(`[${result}]`);

			expect(parsed.length).toEqual(vectorArray.length);

			for (let i = 0; i < parsed.length; i++) {
				const resultVec = parsed[i];
				const expVec = vectorArray[i];

				expect(resultVec[0]).toBeCloseTo(expVec[0], 4);
				expect(resultVec[1]).toBeCloseTo(expVec[1], 4);
				expect(resultVec[2]).toBeCloseTo(expVec[2], 4);
			}
		});

		test('should convert binary vectors in the big endian format (explicit) to a JSON Array', () => {
			const isLittleEndian = false;
			const { vectorArray, buffer } = ServiceHelper.generateRandomBinary3DVectorData(noVectors, isLittleEndian);
			const obj = new BinToVector3dStringStream({ isLittleEndian });

			const result = obj.binToJSONArrayVector3d(buffer, isLittleEndian);

			const parsed = JSON.parse(`[${result}]`);

			expect(parsed.length).toEqual(vectorArray.length);

			for (let i = 0; i < parsed.length; i++) {
				const resultVec = parsed[i];
				const expVec = vectorArray[i];

				expect(resultVec[0]).toBeCloseTo(expVec[0], 4);
				expect(resultVec[1]).toBeCloseTo(expVec[1], 4);
				expect(resultVec[2]).toBeCloseTo(expVec[2], 4);
			}
		});

		test('should convert binary vectors in the big endian format (implicit) to a JSON Array', () => {
			const isLittleEndian = false;
			const { vectorArray, buffer } = ServiceHelper.generateRandomBinary3DVectorData(noVectors, isLittleEndian);
			const obj = new BinToVector3dStringStream();

			const result = obj.binToJSONArrayVector3d(buffer);

			const parsed = JSON.parse(`[${result}]`);

			expect(parsed.length).toEqual(vectorArray.length);

			for (let i = 0; i < parsed.length; i++) {
				const resultVec = parsed[i];
				const expVec = vectorArray[i];

				expect(resultVec[0]).toBeCloseTo(expVec[0], 4);
				expect(resultVec[1]).toBeCloseTo(expVec[1], 4);
				expect(resultVec[2]).toBeCloseTo(expVec[2], 4);
			}
		});
	});
};

const testBinaryToStream = () => {
	const noVectors = 10;

	describe('Convert binary vectors to string stream', () => {
		test('should convert a single buffer of binary vectors in the little endian format to a string stream', async () => {
			const isLittleEndian = true;
			const { vectorArray, buffer } = ServiceHelper.generateRandomBinary3DVectorData(noVectors, isLittleEndian);
			const vertStream = Readable.from(buffer);

			const resultStream = vertStream.pipe(new BinToVector3dStringStream({ isLittleEndian }));

			let resultStr = '';
			for await (const chunk of resultStream) {
				resultStr += chunk;
			}

			const parsed = JSON.parse(`[${resultStr}]`);

			expect(parsed.length).toEqual(vectorArray.length);

			for (let i = 0; i < parsed.length; i++) {
				const resultVec = parsed[i];
				const expVec = vectorArray[i];

				expect(resultVec[0]).toBeCloseTo(expVec[0], 4);
				expect(resultVec[1]).toBeCloseTo(expVec[1], 4);
				expect(resultVec[2]).toBeCloseTo(expVec[2], 4);
			}
		});

		test('should convert a single buffer of binary vectors in the big endian format to a string stream', async () => {
			const isLittleEndian = false;
			const { vectorArray, buffer } = ServiceHelper.generateRandomBinary3DVectorData(noVectors, isLittleEndian);
			const vertStream = Readable.from(buffer);

			const resultStream = vertStream.pipe(new BinToVector3dStringStream({ isLittleEndian }));

			let resultStr = '';
			for await (const chunk of resultStream) {
				resultStr += chunk;
			}

			const parsed = JSON.parse(`[${resultStr}]`);

			expect(parsed.length).toEqual(vectorArray.length);

			for (let i = 0; i < parsed.length; i++) {
				const resultVec = parsed[i];
				const expVec = vectorArray[i];

				expect(resultVec[0]).toBeCloseTo(expVec[0], 4);
				expect(resultVec[1]).toBeCloseTo(expVec[1], 4);
				expect(resultVec[2]).toBeCloseTo(expVec[2], 4);
			}
		});

		test('should convert multiple buffers of binary vectors in the little endian format to a string stream', async () => {
			const isLittleEndian = true;
			const { vectorArray, buffer } = ServiceHelper.generateRandomBinary3DVectorData(noVectors, isLittleEndian);
			const vertStream1 = Readable.from(buffer);
			const vertStream2 = Readable.from(buffer);

			const obj = new BinToVector3dStringStream({ isLittleEndian });
			vertStream1.pipe(obj);
			const resultStream = vertStream2.pipe(obj);

			let resultStr = '';
			for await (const chunk of resultStream) {
				resultStr += chunk;
			}

			const parsed = JSON.parse(`[${resultStr}]`);

			expect(parsed.length).toEqual(vectorArray.length * 2);

			for (let i = 0; i < parsed.length; i++) {
				const resultVec = parsed[i];
				const expVec = vectorArray[i % vectorArray.length];

				expect(resultVec[0]).toBeCloseTo(expVec[0], 4);
				expect(resultVec[1]).toBeCloseTo(expVec[1], 4);
				expect(resultVec[2]).toBeCloseTo(expVec[2], 4);
			}
		});

		test('should convert multiple buffers of binary vectors in the big endian format to a string stream', async () => {
			const isLittleEndian = false;
			const { vectorArray, buffer } = ServiceHelper.generateRandomBinary3DVectorData(noVectors, isLittleEndian);
			const vertStream1 = Readable.from(buffer);
			const vertStream2 = Readable.from(buffer);

			const obj = new BinToVector3dStringStream({ isLittleEndian });
			vertStream1.pipe(obj);
			const resultStream = vertStream2.pipe(obj);

			let resultStr = '';
			for await (const chunk of resultStream) {
				resultStr += chunk;
			}

			const parsed = JSON.parse(`[${resultStr}]`);

			expect(parsed.length).toEqual(vectorArray.length * 2);

			for (let i = 0; i < parsed.length; i++) {
				const resultVec = parsed[i];
				const expVec = vectorArray[i % vectorArray.length];

				expect(resultVec[0]).toBeCloseTo(expVec[0], 4);
				expect(resultVec[1]).toBeCloseTo(expVec[1], 4);
				expect(resultVec[2]).toBeCloseTo(expVec[2], 4);
			}
		});
	});
};

describe('utils/helper/binaryVector', () => {
	testBinaryToStream();
	testBinToJSONArrayVector3d();
});
