"use strict";
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
const responseCodes = require("../../../../src/v4/response_codes");
const alluxio = require("../../../../src/v4/handler/alluxio");
const config = require("../../../../src/v4/config");

const fileList = [];

(config.alluxio ? describe : describe.skip)("Check Alluxio handler", function() {
	describe("getAlluxioPathFormat", function () {
		it("get path should succeed", async function() {
			const link = "test_string";
			const path = await alluxio.getAlluxioPathFormat(link);
			expect(path).toBe(`/${link}`);
		});

		it("get path on number should fail", async function() {
			const link = 12345678;
			try {
				await alluxio.getAlluxioPathFormat(link);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("get path on date should fail", async function() {
			const link = new Date();
			try {
				await alluxio.getAlluxioPathFormat(link);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("get path on non-string should fail", async function() {
			const link = { "badData": true };
			try {
				await alluxio.getAlluxioPathFormat(link);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("storeFile", function () {
		it("store file should succeed", async function() {
			const data = "string data";
			const result = await alluxio.storeFile(data);
			expect(result).toBeTruthy();
			expect(result).toHaveProperty("_id");
			expect(result).toHaveProperty("link");
			expect(result).toHaveProperty("size");
			expect(result).toHaveProperty("type");
			expect(result.size).toBe(data.length);
			expect(result.type).toBe("alluxio");
			fileList.push(result);
		});

		it("store file (buffer) should succeed", async function() {
			const data = Buffer.alloc(8);
			const result = await alluxio.storeFile(data);
			expect(result).toBeTruthy();
			expect(result).toHaveProperty("_id");
			expect(result).toHaveProperty("link");
			expect(result).toHaveProperty("size");
			expect(result).toHaveProperty("type");
			expect(result.size).toBe(data.length);
			expect(result.type).toBe("alluxio");
			fileList.push(result);
		});

		it("store file (JSON string) should succeed", async function() {
			const data = JSON.stringify({
				"test": "data"
			});
			const result = await alluxio.storeFile(data);
			expect(result).toBeTruthy();
			expect(result).toHaveProperty("_id");
			expect(result).toHaveProperty("link");
			expect(result).toHaveProperty("size");
			expect(result).toHaveProperty("type");
			expect(result.size).toBe(data.length);
			expect(result.type).toBe("alluxio");
			fileList.push(result);
		});

		it("store file with invalid data should fail", async function() {
			const data = 123;
			try {
				await alluxio.storeFile(data);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("getFile", function () {
		it("get file should succeed", async function() {
			const fileInfo = fileList[0];
			const file = await alluxio.getFile(fileInfo.link);
			expect(file).toHaveLength(fileInfo.size);
		});

		it("get file with incorrect key should fail", async function() {
			try {
				await alluxio.getFile("badKey");
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err.status).toBe(responseCodes.NO_FILE_FOUND.status);
				expect(err.value).toBe(responseCodes.NO_FILE_FOUND.value);
			}
		});
	});

	describe("getFileStream", function () {
		// FIXME: See https://github.com/axios/axios/issues/1418#issuecomment-373386206
		/*
		it("get file stream should succeed", async function() {
			const fileInfo = fileList[1];
			const stream = await alluxio.getFileStream(fileInfo.link);
			console.log(stream);
			expect(stream).toHaveLength(fileInfo.size);
		});
		*/

		it("get file stream with incorrect key should fail", async function() {
			try {
				await alluxio.getFileStream("badLink");
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err.status).toBe(responseCodes.NO_FILE_FOUND.status);
				expect(err.value).toBe(responseCodes.NO_FILE_FOUND.value);
			}
		});
	});

	describe("removeFile", function () {
		let fileInfo;

		it("remove file should succeed", async function() {
			fileInfo = fileList.pop();
			const result = await alluxio.removeFile(fileInfo.link);
			expect(result).toBeTruthy();
		});

		it("remove same file again should fail", async function() {
			try {
				await alluxio.removeFile(fileInfo.link);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("remove file with incorrect key should fail", async function() {
			try {
				await alluxio.removeFile("notexist");
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("removeFiles", function () {
		let links;

		it("remove files should succeed", async function() {
			links = fileList.map(f => f.link);
			const result = await alluxio.removeFiles(links);
			expect(result).toHaveLength(links.length);
		});

		it("remove files for same links again should fail", async function() {
			try {
				await alluxio.removeFiles(links);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("remove files for incorrect links should fail", async function() {
			try {
				await alluxio.removeFiles(["bad", "nonexistent", "links"]);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});
});
