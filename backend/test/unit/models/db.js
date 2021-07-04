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

const expect = require("chai").expect;
const proxyquire = require("proxyquire").noCallThru();
const checkPermission  = proxyquire("../../../middlewares/checkPermissions", {
	"./getPermissionsAdapter": {},
	"../response_codes": {}
}).checkPermissionsHelper;
const db = require("../../../handler/db");

const account = "testuser";
const password = "testuser";
const model = "af1ccf84-71c3-490e-9e5a-cb80e30ee519";

const goldenColls = [
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.history.files', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.stash.3drepo.chunks', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.stash.3drepo', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.stash.json_mpc.chunks', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.stash.json_mpc.chunks', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.groups', options: {} },
	{ name: 'ca2cd8d0-c7e9-4362-baaf-e089bcb7b803.scene', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.history.files', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.issues', options: {} },
	{ name: 'settings', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.stash.json_mpc.ref', options: {} },
	{ name: 'ca2cd8d0-c7e9-4362-baaf-e089bcb7b803.stash.json_mpc.files', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.stash.unity3d.ref', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.stash.unity3d.chunks', options: {} },
	{ name: 'jobs', options: {} },
	{ name: 'ca2cd8d0-c7e9-4362-baaf-e089bcb7b803.issues', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.stash.json_mpc.files', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.stash.unity3d.chunks', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.stash.3drepo.files', options: {} },
	{ name: 'ca2cd8d0-c7e9-4362-baaf-e089bcb7b803.stash.json_mpc.ref', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.history.ref', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.history', options: {} },
	{ name: 'teamspace', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.stash.json_mpc.files', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.history', options: {} },
	{ name: 'ca2cd8d0-c7e9-4362-baaf-e089bcb7b803.history', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.stash.json_mpc.ref', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.history.chunks', options: {} },
	{ name: 'ca2cd8d0-c7e9-4362-baaf-e089bcb7b803.stash.json_mpc.chunks', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.groups', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.history.chunks', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.stash.unity3d', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.issues', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.scene', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.history.ref', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.stash.unity3d.ref', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.stash.3drepo', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.stash.unity3d', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.scene', options: {} },
	{ name: 'projects', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.stash.unity3d.files', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.stash.unity3d.files', options: {} }
];

const goldenJobs = [
	{ _id: 'Architect', users: [] },
	{ _id: 'Asset Manager', users: [] },
	{ _id: 'Client', users: [] },
	{ _id: 'MEP Engineer', users: [] },
	{ _id: 'Main Contractor', users: [] },
	{ _id: 'Project Manager', users: [] },
	{ _id: 'Quantity Surveyor', users: [] },
	{ _id: 'Structural Engineer', users: [] },
	{ _id: 'Supplier', users: [] }
];

const goldenProjectNames = [{"name":"Sample_Project"}];

const goldenIssues = [
];

describe("Check DB handler", function() {

	describe("authenticate", function () {
		it("valid credentials should succeed", async function() {
			await db.authenticate(account, password);
		});

		it("incorrect username casing should fail", async function() {
			try {
				await db.authenticate(account.toUpperCase(), password);
			} catch (err) {
				expect(err.code).to.equal(18);
				expect(err.message).to.equal("Authentication failed.");
			}
		});

		it("incorrect password should fail", async function() {
			try {
				await db.authenticate(account, "badPassword");
			} catch (err) {
				expect(err.code).to.equal(18);
				expect(err.message).to.equal("Authentication failed.");
			}
		});
	});

	describe("find", function () {
		it("find jobs should succeed", async function() {
			const jobs = await db.find(account, "jobs", {});
			expect(jobs).to.deep.equal(goldenJobs);
		});

		it("find Architect job should succeed", async function() {
			const jobs = await db.find(account, "jobs", { _id: "Architect" });
			expect(jobs[0]).to.deep.equal(goldenJobs[0]);
		});

		it("find project that doesn't exist should succeed", async function() {
			const projectNames = await db.find(account, "projects", {name: "doesn't exist"}, { _id: 0, name: 1 });
			expect(projectNames).to.be.empty;
		});

		it("find issues with multiple conditions should succeed", async function() {
			const query = {creator_role: "Architect", priority: "high"};
			const issues = await db.find(account, `${model}.issues`, query);
			expect(issues).to.have.lengthOf(1);
			expect(issues[0].creator_role).to.equal(query.creator_role);
			expect(issues[0].priority).to.equal(query.priority);
		});

		it("find projects with projection should succeed", async function() {
			const projectNames = await db.find(account, "projects", {}, { _id: 0, name: 1 });
			expect(projectNames).to.deep.equal(goldenProjectNames);
		});

		it("find settings with sort should succeed", async function() {
			const settings = await db.find(account, "settings", {}, {}, { timestamp: -1 });
			expect(settings[0].name).to.equal("Sample_Federation");
			expect(settings[1].name).to.equal("Sample_House");
			expect(settings[2].name).to.equal("Sample_Tree");
		});

		it("find with incorrect username should be empty", async function() {
			const settings = await db.find("wrong", "settings", {});
			expect(settings).to.be.empty;
		});

		it("find with incorrect collection should be empty", async function() {
			const settings = await db.find(account, "wrongOne", {});
			expect(settings).to.be.empty;
		});
	});

	describe("findOne", function () {
		it("find one job should succeed", async function() {
			const job = await db.findOne(account, "jobs", {_id: "Architect"});
			expect(job).to.deep.equal(goldenJobs[0]);
		});

		it("find one unspecified job should return first one and succeed", async function() {
			const job = await db.findOne(account, "jobs", {});
			expect(job).to.deep.equal(goldenJobs[0]);
		});

		it("find one project that doesn't exist should succeed", async function() {
			const projectName = await db.findOne(account, "projects", {name: "doesn't exist"}, { _id: 0, name: 1 });
			expect(projectName).to.be.null;
		});

		it("find one issue with multiple conditions should succeed", async function() {
			const query = {creator_role: "Architect", priority: "high"};
			const issue = await db.findOne(account, `${model}.issues`, query);
			expect(issue.creator_role).to.equal(query.creator_role);
			expect(issue.priority).to.equal(query.priority);
		});

		it("find one project with projection should succeed", async function() {
			const projectName = await db.findOne(account, "projects", {}, { _id: 0, name: 1 });
			expect(projectName).to.deep.equal(goldenProjectNames[0]);
		});

		it("find one setting with sort should succeed", async function() {
			const setting = await db.findOne(account, "settings", {}, {}, { timestamp: -1 });
			expect(setting.name).to.equal("Sample_Federation");
		});

		it("find one with incorrect username should be null", async function() {
			const setting = await db.findOne("wrong", "settings", {});
			expect(setting).to.be.null;
		});

		it("find one with incorrect collection should be null", async function() {
			const setting = await db.findOne(account, "wrongOne", {});
			expect(setting).to.be.null;
		});
	});

	describe("getDB", function () {
		it("get DB should succeed", async function() {
			const database = await db.getDB(account);
			expect(database).to.exist;
		});

		it("get DB with incorrect username should be empty", async function() {
			const database = await db.getDB("wrong");
			expect(database).to.exist;
		});
	});

	describe("getAuthDB", function () {
		it("get auth DB should succeed", async function() {
			const database = await db.getAuthDB();
			expect(database).to.exist;


		});
	});

	describe("getCollection", function () {
		it("get collection should succeed", async function() {
			const coll = await db.getCollection(account, "jobs");
			expect(coll).to.exist;
		});

		it("get collection with incorrect username should be empty", async function() {
			const coll = await db.getCollection("wrong", "jobs");
			expect(coll).to.exist;
		});
	});

	describe("geCollectionStats", function () {
		it("get collection stats should succeed", async function() {
			const stats = await db.getCollectionStats(account, "jobs");
			expect(stats).to.exist;
			expect(stats.ok).to.equal(1);
		});

		it("get collection stats with incorrect username should fail", async function() {
			try {
				await db.getCollectionStats("wrong", "jobs");
				throw {};
			} catch (err) {
				expect(err.name).to.equal("MongoError");
				expect(err.message).to.equal("Database [wrong] not found.");
			}
		});
	});

	describe("getFileStreamFromGridFS", function () {
	});

	describe("insert", function () {
	});

	describe("insertMany", function () {
	});

	describe("getFileFromGridFS", function () {
	});

	describe("storeFileInGridFS", function () {
	});

	describe("listCollections", function () {
		it("list collection with valid username should succeed", async function() {
			const colls = await db.listCollections(account);
			expect(colls).to.deep.equal(goldenColls);
		});

		it("list collection with incorrect username should be empty", async function() {
			const colls = await db.listCollections("wrong");
			expect(colls).to.be.empty;
		});
	});

	describe("remove", function () {
	});

	describe("runCommand", function () {
	});

	describe("getSessionStore", function () {
	});

	describe("update", function () {
	});

	describe("updateOne", function () {
	});

	describe("count", function () {
		it("count jobs should succeed", async function() {
			const jobs = await db.count(account, "jobs", {});
			expect(jobs).to.equal(goldenJobs.length);
		});

		it("count Architect job should succeed", async function() {
			const jobs = await db.count(account, "jobs", { _id: "Architect" });
			expect(jobs).to.equal(1);
		});

		it("count project that doesn't exist should succeed", async function() {
			const projectNames = await db.count(account, "projects", {name: "doesn't exist"}, { _id: 0, name: 1 });
			expect(projectNames).to.equal(0);
		});

		it("count issues with multiple conditions should succeed", async function() {
			const query = {creator_role: "Architect", priority: "high"};
			const issues = await db.count(account, `${model}.issues`, query);
			expect(issues).to.equal(1);
		});

		it("count with incorrect username should succeed", async function() {
			const settings = await db.count("wrong", "settings", {});
			expect(settings).to.equal(0);
		});

		it("count with incorrect collection should succeed", async function() {
			const settings = await db.count(account, "wrongOne", {});
			expect(settings).to.equal(0);
		});
	});

	describe("findOneAndDelete", function () {
	});

	describe("disconnect", function () {
		it("should succeed", async function() {
			try {
				await db.disconnect();
			} catch (err) {
				expect(err).to.be.null;
			}
		});

		it("should succeed", async function() {
			try {
				await db.getCollection(account, "jobs");
			} catch (err) {
				console.log(err);
				expect(err).to.be.null;
			}
		});
	});
});
