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

const { BinToFaceStringStream } = require(`${src}/utils/helper/binaryFace`);
const ServiceHelper = require('../../../helper/services');

const testBinaryToStream = () => {
	const noFaces = 10;

	describe('Convert binary faces to string stream', () => {
		test('should convert a single buffer of binary faces in the little endian format to a string stream', async () => {
			const isLittleEndian = true;
			const { faceArray, buffer } = ServiceHelper.generateRandomBinaryFaceData(noFaces, isLittleEndian);
			const faceStream = Readable.from(buffer);

			const resultStream = faceStream.pipe(new BinToFaceStringStream({ isLittleEndian }));

			let resultStr = '';
			for await (const chunk of resultStream) {
				resultStr += chunk;
			}

			const parsed = JSON.parse(`[${resultStr}]`);

			expect(parsed.length).toEqual(faceArray.length * 3);

			for (let i = 0; i < faceArray.length; i++) {
				const expFace = faceArray[i];

				const offset = i * 3;
				expect(parsed[offset]).toEqual(expFace[0], 4);
				expect(parsed[offset + 1]).toEqual(expFace[1], 4);
				expect(parsed[offset + 2]).toEqual(expFace[2], 4);
			}
		});

		test('should convert a single buffer of binary faces in the big endian format to a string stream', async () => {
			const isLittleEndian = false;
			const { faceArray, buffer } = ServiceHelper.generateRandomBinaryFaceData(noFaces, isLittleEndian);
			const faceStream = Readable.from(buffer);

			const resultStream = faceStream.pipe(new BinToFaceStringStream({ isLittleEndian }));

			let resultStr = '';
			for await (const chunk of resultStream) {
				resultStr += chunk;
			}

			const parsed = JSON.parse(`[${resultStr}]`);

			expect(parsed.length).toEqual(faceArray.length * 3);

			for (let i = 0; i < faceArray.length; i++) {
				const expFace = faceArray[i];

				const offset = i * 3;
				expect(parsed[offset]).toEqual(expFace[0], 4);
				expect(parsed[offset + 1]).toEqual(expFace[1], 4);
				expect(parsed[offset + 2]).toEqual(expFace[2], 4);
			}
		});

		test('should convert multiple buffers of binary faces in the little endian format to a string stream', async () => {
			const isLittleEndian = true;
			const { faceArray, buffer } = ServiceHelper.generateRandomBinaryFaceData(noFaces, isLittleEndian);
			const faceStream1 = Readable.from(buffer);
			const faceStream2 = Readable.from(buffer);

			const obj = new BinToFaceStringStream({ isLittleEndian });
			faceStream1.pipe(obj);
			const resultStream = faceStream2.pipe(obj);

			let resultStr = '';
			for await (const chunk of resultStream) {
				resultStr += chunk;
			}

			const parsed = JSON.parse(`[${resultStr}]`);

			expect(parsed.length).toEqual(faceArray.length * 6);

			for (let i = 0; i < faceArray.length; i++) {
				const expFace = faceArray[i];

				const offset = i * 3;
				expect(parsed[offset]).toEqual(expFace[0], 4);
				expect(parsed[offset + 1]).toEqual(expFace[1], 4);
				expect(parsed[offset + 2]).toEqual(expFace[2], 4);
			}
		});

		test('should convert multiple buffers of binary faces in the big endian format (explicit) to a string stream', async () => {
			const isLittleEndian = false;
			const { faceArray, buffer } = ServiceHelper.generateRandomBinaryFaceData(noFaces, isLittleEndian);
			const faceStream1 = Readable.from(buffer);
			const faceStream2 = Readable.from(buffer);

			const obj = new BinToFaceStringStream({ isLittleEndian });
			faceStream1.pipe(obj);
			const resultStream = faceStream2.pipe(obj);

			let resultStr = '';
			for await (const chunk of resultStream) {
				resultStr += chunk;
			}

			const parsed = JSON.parse(`[${resultStr}]`);

			expect(parsed.length).toEqual(faceArray.length * 6);

			for (let i = 0; i < (faceArray.length * 2); i++) {
				const expFace = faceArray[i % faceArray.length];

				const offset = i * 3;
				expect(parsed[offset]).toEqual(expFace[0], 4);
				expect(parsed[offset + 1]).toEqual(expFace[1], 4);
				expect(parsed[offset + 2]).toEqual(expFace[2], 4);
			}
		});

		test('should convert multiple buffers of binary faces in the big endian format (implicit) to a string stream', async () => {
			const isLittleEndian = false;
			const { faceArray, buffer } = ServiceHelper.generateRandomBinaryFaceData(noFaces, isLittleEndian);
			const faceStream1 = Readable.from(buffer);
			const faceStream2 = Readable.from(buffer);

			const obj = new BinToFaceStringStream();
			faceStream1.pipe(obj);
			const resultStream = faceStream2.pipe(obj);

			let resultStr = '';
			for await (const chunk of resultStream) {
				resultStr += chunk;
			}

			const parsed = JSON.parse(`[${resultStr}]`);

			expect(parsed.length).toEqual(faceArray.length * 6);

			for (let i = 0; i < (faceArray.length * 2); i++) {
				const expFace = faceArray[i % faceArray.length];

				const offset = i * 3;
				expect(parsed[offset]).toEqual(expFace[0], 4);
				expect(parsed[offset + 1]).toEqual(expFace[1], 4);
				expect(parsed[offset + 2]).toEqual(expFace[2], 4);
			}
		});
	});
};

describe('utils/helper/binaryFace', () => {
	testBinaryToStream();
});
