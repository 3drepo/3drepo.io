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
const config = require("../../../../src/v4/config");
const utils = require("../../../../src/v4/utils");
const responseCodes = require("../../../../src/v4/response_codes");
const AlluxioClient = require("../../../../src/v4/handler/alluxioClient");

let client;
let levels;

const fileList = [];
const uuid = utils.generateUUID({string: true});
let fileId;

beforeAll(function(done) {
	if (config.alluxio) {
		const {hostname, port} = config.alluxio;
		client = new AlluxioClient(`${hostname}:${port}`);
		levels = config.alluxio.levels;
	}
	done();
});

(config.alluxio ? describe : describe.skip)("Check Alluxio client", function() {
	describe("getInfo", function () {
		it("get info should succeed", async function() {
			const result = await client.getInfo();
			expect(result).toBeTruthy();
			expect(result).toHaveProperty("version");
			expect(result).toHaveProperty("configuration");
			expect(result).toHaveProperty("startTimeMs");
			expect(result).toHaveProperty("uptimeMs");
			console.log(`========== ALLUXIO VERSION: ${result.version} ==========`);
		});
	});

	describe("getURL", function () {
		it("get URL should succeed", async function() {
			const basePath = "test";
			const url = client.getURL(basePath);
			expect(config.alluxio).toBeTruthy();
			expect(config.alluxio.hostname).toBeTruthy();
			expect(config.alluxio.port).toBeTruthy();
			const {hostname, port} = config.alluxio;
			expect(url).toBe(`http://${hostname}:${port}/api/v1/${basePath}`);
		});
	});

	describe("getPathsURL", function () {
		it("get paths URL should succeed", async function() {
			const action = "act1";
			const path = "test1";
			const url = client.getPathsURL(action, path);
			expect(url).toBe(`${client.getURL("paths")}/${path}/${action}`);
		});
	});

	describe("getStreamsURL", function () {
		it("get streams URL should succeed", async function() {
			const action = "act1";
			const id = "test1";
			const url = client.getStreamsURL(action, id);
			expect(url).toBe(`${client.getURL("streams")}/${id}/${action}`);
		});
	});

	describe("postToPathRoute", function () {
		it("POST to path should succeed", async function() {
			const path = "/";
			const action = "list-status";
			const result = await client.postToPathRoute(path, undefined, action);
			expect(result).toBeTruthy();
		});

		it("POST to path with stream action should fail", async function() {
			const path = "/";
			const action = "close";
			try {
				await client.postToPathRoute(path, undefined, action);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("POST to path with invalid action should fail", async function() {
			const path = "/";
			const action = "invalidAct";
			try {
				await client.postToPathRoute(path, undefined, action);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("POST to path with bad path should fail", async function() {
			const path = `/${uuid}-notexist`;
			const action = "list-status";
			try {
				await client.postToPathRoute(path, undefined, action);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("POST to path with invalid options should fail", async function() {
			const path = "/";
			const opts = { badOpts: true };
			const action = "list-status";
			try {
				await client.postToPathRoute(path, opts, action);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("ls", function () {
		it("ls should succeed", async function() {
			const path = "/";
			const result = await client.ls(path, undefined);
			expect(result).toBeTruthy();
			expect(Array.isArray(result)).toBe(true);
		});

		it("ls with non-existent dir should fail", async function() {
			const path = `${uuid}-invalidDir`;
			try {
				await client.ls(path, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("createDirectory", function () {
		it("create dir should succeed", async function() {
			const path = `/${uuid}`;
			const result = await client.createDirectory(path, undefined);
			expect(result).toBe("");
		});

		it("create same dir again should fail", async function() {
			const path = `/${uuid}`;
			try {
				await client.createDirectory(path, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("create dir without first slash should fail", async function() {
			const path = `${uuid}-v2`;
			try {
				await client.createDirectory(path, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("createFile", function () {
		it("create file should succeed", async function() {
			const path = `/${uuid}/test1`;
			const result = await client.createFile(path, undefined);
			expect(result).toBeTruthy();
			fileId = result;
		});

		it("create same file again should fail", async function() {
			const path = `/${uuid}/test1`;
			try {
				await client.createFile(path, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("create file with bad path should fail", async function() {
			const path = `/${uuid}-badDir/test2`;
			try {
				await client.createFile(path, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("create file missing first slash should fail", async function() {
			const path = `${uuid}/test3`;
			try {
				await client.createFile(path, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("postToStreamRoute", function () {
		it("POST to path should succeed", async function() {
			const path = `/${uuid}/test4`;
			const id = await client.createFile(path, undefined);
			const action = "close";
			const result = await client.postToStreamRoute(id, undefined, action);
			expect(result).toBeTruthy();
			expect(result).toBe("");
		});

		it("POST to path with non-stream action should fail", async function() {
			const path = `/${uuid}/test5`;
			const id = await client.createFile(path, undefined);
			const action = "list-status";
			try {
				await client.postToStreamRoute(id, undefined, action);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("POST to path with bad action should fail", async function() {
			const path = `/${uuid}/test6`;
			const id = await client.createFile(path, undefined);
			const action = "invalid";
			try {
				await client.postToStreamRoute(id, undefined, action);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("getStatus", function () {
		it("get status should succeed", async function() {
			const path = `/${uuid}/test1`;
			const result = await client.getStatus(path, undefined);
			expect(result).toBeTruthy();
			expect(result).toHaveProperty("owner");
			expect(result).toHaveProperty("ttl");
			expect(result).toHaveProperty("defaultAcl");
			expect(result).toHaveProperty("blockIds");
			expect(result).toHaveProperty("creationTimeMs");
			expect(result).toHaveProperty("inMemoryPercentage");
			expect(result).toHaveProperty("inAlluxioPercentage");
			expect(result).toHaveProperty("lastModificationTimeMs");
			expect(result).toHaveProperty("ttlAction");
			expect(result).toHaveProperty("cacheable");
			expect(result).toHaveProperty("pinnedMediumTypes");
			expect(result).toHaveProperty("mountPoint");
			expect(result).toHaveProperty("ufsFingerprint");
			expect(result).toHaveProperty("blockSizeBytes");
			expect(result).toHaveProperty("pinned");
			expect(result).toHaveProperty("lastAccessTimeMs");
			expect(result).toHaveProperty("group");
			expect(result).toHaveProperty("fileBlockInfos");
			expect(result).toHaveProperty("folder");
			expect(result).toHaveProperty("completed");
			expect(result).toHaveProperty("ufsPath");
			expect(result).toHaveProperty("mountId");
			expect(result).toHaveProperty("acl");
			expect(result).toHaveProperty("persisted");
			expect(result).toHaveProperty("persistenceState");
			expect(result).toHaveProperty("replicationMin");
			expect(result).toHaveProperty("mode");
			expect(result).toHaveProperty("replicationMax");
			expect(result).toHaveProperty("fileId");
			expect(result).toHaveProperty("length");
			expect(result).toHaveProperty("name");
			expect(result).toHaveProperty("path");
			expect(result.folder).toBe(false);
		});

		it("get status on directory should succeed", async function() {
			const path = `/${uuid}`;
			const result = await client.getStatus(path, undefined);
			expect(result).toBeTruthy();
			expect(result).toHaveProperty("owner");
			expect(result).toHaveProperty("ttl");
			expect(result).toHaveProperty("defaultAcl");
			expect(result).toHaveProperty("blockIds");
			expect(result).toHaveProperty("creationTimeMs");
			expect(result).toHaveProperty("inMemoryPercentage");
			expect(result).toHaveProperty("inAlluxioPercentage");
			expect(result).toHaveProperty("lastModificationTimeMs");
			expect(result).toHaveProperty("ttlAction");
			expect(result).toHaveProperty("cacheable");
			expect(result).toHaveProperty("pinnedMediumTypes");
			expect(result).toHaveProperty("mountPoint");
			expect(result).toHaveProperty("ufsFingerprint");
			expect(result).toHaveProperty("blockSizeBytes");
			expect(result).toHaveProperty("pinned");
			expect(result).toHaveProperty("lastAccessTimeMs");
			expect(result).toHaveProperty("group");
			expect(result).toHaveProperty("fileBlockInfos");
			expect(result).toHaveProperty("folder");
			expect(result).toHaveProperty("completed");
			expect(result).toHaveProperty("ufsPath");
			expect(result).toHaveProperty("mountId");
			expect(result).toHaveProperty("acl");
			expect(result).toHaveProperty("persisted");
			expect(result).toHaveProperty("persistenceState");
			expect(result).toHaveProperty("replicationMin");
			expect(result).toHaveProperty("mode");
			expect(result).toHaveProperty("replicationMax");
			expect(result).toHaveProperty("fileId");
			expect(result).toHaveProperty("length");
			expect(result).toHaveProperty("name");
			expect(result).toHaveProperty("path");
			expect(result.folder).toBe(true);
		});

		it("get status on non-existent directory should fail", async function() {
			const path = `/${uuid}-gone`;
			try {
				await client.getStatus(path, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("get status on non-existent file should fail", async function() {
			const path = `/${uuid}-bad/badFile`;
			try {
				await client.getStatus(path, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("exists", function () {
		it("exists should succeed", async function() {
			const path = `/${uuid}/test1`;
			const result = await client.exists(path, undefined);
			expect(result).toBe(true);
		});

		it("exists on non-existent file should return false", async function() {
			const path = `/${uuid}-badDir/nope`;
			const result = await client.exists(path, undefined);
			expect(result).toBe(false);
		});
	});

	describe("listStatus", function () {
		it("list status should succeed", async function() {
			const path = "/";
			const result = await client.listStatus(path, undefined);
			expect(result).toBeTruthy();
			expect(Array.isArray(result)).toBe(true);
		});

		it("list status on single file should succeed", async function() {
			const path = `/${uuid}/test1`;
			const result = await client.listStatus(path, undefined);
			expect(result).toBeTruthy();
			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(1);
		});

		it("list status on non-existent directory should fail", async function() {
			const path = `/${uuid}-nopedir`;
			try {
				await client.listStatus(path, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("list status on non-existent file should fail", async function() {
			const path = `/${uuid}/nope`;
			try {
				await client.listStatus(path, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("write", function () {
		it("write should succeed", async function() {
			const id = fileId;
			const data = "abcdefg";
			const result = await client.write(id, data);
			expect(result).toBeTruthy();
			expect(result).toHaveProperty("status");
			expect(result).toHaveProperty("statusText");
			expect(result).toHaveProperty("data");
			expect(result.status).toBe(200);
			expect(result.statusText).toBe("OK");
			expect(result.data).toBe(data.length);
		});

		it("write buffer should succeed", async function() {
			const id = fileId;
			const data = Buffer.alloc(8);
			const result = await client.write(id, data);
			expect(result).toBeTruthy();
			expect(result).toHaveProperty("status");
			expect(result).toHaveProperty("statusText");
			expect(result).toHaveProperty("data");
			expect(result.status).toBe(200);
			expect(result.statusText).toBe("OK");
			expect(result.data).toBe(data.length);
		});

		it("write date should succeed", async function() {
			const id = fileId;
			const data = new Date();
			const result = await client.write(id, data);
			expect(result).toBeTruthy();
			expect(result).toHaveProperty("status");
			expect(result).toHaveProperty("statusText");
			expect(result).toHaveProperty("data");
			expect(result.status).toBe(200);
			expect(result.statusText).toBe("OK");
		});

		it("write number should fail", async function() {
			const id = fileId;
			const data = 12345678;
			try {
				await client.write(id, data);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("write bool should fail", async function() {
			const id = fileId;
			const data = true;
			try {
				await client.write(id, data);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("write to invalid ID should fail", async function() {
			const id = "invalidId";
			const data = "abcdefg";
			try {
				const result = await client.write(id, data);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("closeFile", function () {
		it("close file should succeed", async function() {
			const id = fileId;
			const result = await client.closeFile(id, undefined);
			expect(result).toBeTruthy();
			expect(result).toBe("");
		});

		it("close file again should fail", async function() {
			const id = fileId;
			try {
				await client.closeFile(id, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("close file with invalid ID should fail", async function() {
			const id = "badId";
			try {
				await client.closeFile(id, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("openFile", function () {
		it("open file should succeed", async function() {
			const path = `/${uuid}/test1`;
			const result = await client.openFile(path, undefined);
			expect(result).toBeTruthy();
		});

		it("open file again should succeed", async function() {
			const path = `/${uuid}/test1`;
			const result = await client.openFile(path, undefined);
			expect(result).toBeTruthy();
		});

		it("open file that has existing stream should fail", async function() {
			const data = "abcdefg";
			const path = `/${uuid}/test7`;
			const id = await client.createFile(path, undefined);
			await client.write(id, data);
			try {
				await client.openFile(path, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("open file that is directory should fail", async function() {
			const path = `/${uuid}`;
			try {
				await client.openFile(path, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("open file that doesn't exist should fail", async function() {
			const path = `/${uuid}/notreal`;
			try {
				await client.openFile(path, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("uploadFile", function () {
		it("upload file should succeed", async function() {
			const link = "/test1";
			const data = "string data";
			fileList.push({link, data});
			await client.uploadFile(link, data);
		});

		it("upload file (buffer) should succeed", async function() {
			const link = "/test2";
			const data = Buffer.alloc(8);
			fileList.push({link, data});
			await client.uploadFile(link, data);
		});

		it("upload file (JSON string) should succeed", async function() {
			const link = "/test3";
			const data = JSON.stringify({
				"test": "data"
			});
			fileList.push({link, data});
			await client.uploadFile(link, data);
		});

		it("upload file with used link should fail", async function() {
			const link = "/test1";
			const data = "string data";
			try {
				await client.uploadFile(link, data);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("upload file with invalid data should fail", async function() {
			const link = "/test4";
			const data = 123;
			try {
				await client.uploadFile(link, data);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("downloadFile", function () {
		it("get file should succeed", async function() {
			const fileInfo = fileList[0];
			const file = await client.downloadFile(fileInfo.link);
			expect(file.toString("utf8")).toBe(fileInfo.data);
		});

		it("get file with incorrect key should fail", async function() {
			try {
				await client.downloadFile("badKey");
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("downloadFileStream", function () {
		// FIXME: See https://github.com/axios/axios/issues/1418#issuecomment-373386206
		/*
		it("get file stream should succeed", async function() {
			const fileInfo = fileList[1];
			const stream = await client.downloadFileStream(fileInfo.link);
			console.log(stream);
			expect(stream).toHaveLength(fileInfo.size);
		});
		*/

		it("get file stream with incorrect key should fail", async function() {
			try {
				await client.downloadFileStream("badLink");
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("delete", function () {
		let fileInfo;

		it("remove file should succeed", async function() {
			fileInfo = fileList.pop();
			const result = await client.delete(fileInfo.link);
			expect(result).toBeTruthy();
		});

		it("remove more files should succeed", async function() {
			while (fileList.length > 0) {
				fileInfo = fileList.pop();
				const result = await client.delete(fileInfo.link);
				expect(result).toBeTruthy();
			}
		});

		it("remove same file again should fail", async function() {
			try {
				await client.delete(fileInfo.link);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("remove file with incorrect key should fail", async function() {
			try {
				await client.delete("notexist");
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("free", function () {
		it("free should succeed", async function() {
			const path = `/${uuid}-emptyDir/`;
			await client.createDirectory(path, undefined);
			const result = await client.free(path, undefined);
			expect(result).toBe("");
		});

		it("free again should succeed", async function() {
			const path = `/${uuid}-emptyDir/`;
			const result = await client.free(path, undefined);
			expect(result).toBe("");
		});

		it("free non-empty directory should fail", async function() {
			const path = `/${uuid}/`;
			try {
				await client.free(path, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("free non-existent directory should fail", async function() {
			const path = `/${uuid}-notexist/`;
			try {
				await client.free(path, undefined);
				throw undefined; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});
});
