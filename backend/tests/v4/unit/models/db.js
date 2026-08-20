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
const proxyquire = require("proxyquire").noCallThru();
const checkPermission = proxyquire("../../../../src/v4/middlewares/checkPermissions", {
	"./getPermissionsAdapter": {},
	"../response_codes": {}
}).checkPermissionsHelper;
const db = require("../../../../src/v4/handler/db");

const account = "testuser";
const password = "testuser";
const model = "af1ccf84-71c3-490e-9e5a-cb80e30ee519";
const gridFsFilename = "cd561c86-de1a-482e-8f5d-89cfc49562e8LAB-BBD-00-ZZ-M3-A-0005_IFC2x3_FM_Handover_ifc";

const goldenColls = [
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.groups', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.history', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.history.ref', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.issues', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.scene', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.scene.ref', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.stash.3drepo', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.stash.3drepo.ref', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.stash.json_mpc.ref', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.stash.unity3d', options: {} },
	{ name: '8f67cd3e-d2f3-4b90-81ae-d65a065d346f.stash.unity3d.ref', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.groups', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.history', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.history.ref', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.issues', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.scene', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.scene.ref', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.stash.3drepo', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.stash.3drepo.ref', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.stash.json_mpc.ref', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.stash.unity3d', options: {} },
	{ name: 'af1ccf84-71c3-490e-9e5a-cb80e30ee519.stash.unity3d.ref', options: {} },
	{ name: 'ca2cd8d0-c7e9-4362-baaf-e089bcb7b803.history', options: {} },
	{ name: 'ca2cd8d0-c7e9-4362-baaf-e089bcb7b803.issues', options: {} },
	{ name: 'ca2cd8d0-c7e9-4362-baaf-e089bcb7b803.scene', options: {} },
	{ name: 'ca2cd8d0-c7e9-4362-baaf-e089bcb7b803.stash.json_mpc.ref', options: {} },
	{ name: 'jobs', options: {} },
	{ name: 'projects', options: {} },
	{ name: 'settings', options: {} },
	{ name: 'teamspace', options: {} },
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
	{ _id: 'Supplier', users: [] },
	{ _id: 'Admin', color: "#f7f7b2", users: ["testuser"] },
];

const goldenProjectNames = [{ "name": "Sample_Project" }];

const newJobIds = [];

describe("Check DB handler", function () {

	describe("authenticate", function () {
		it("valid credentials should succeed", async function () {
			await db.authenticate(account, password);
		});

		it("incorrect username casing should fail", async function () {
			try {
				await db.authenticate(account.toUpperCase(), password);
				throw {}; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});

		it("incorrect password should fail", async function () {
			try {
				await db.authenticate(account, "badPassword");
				throw {}; // should've failed at previous line
			} catch (err) {
				expect(err).toBeTruthy();
			}
		});
	});

	describe("getDB", function () {
		it("get DB should succeed", async function () {
			const database = await db.getDB(account);
			expect(database).toBeTruthy();
		});
	});

	describe("getAuthDB", function () {
		it("get auth DB should succeed", async function () {
			const database = await db.getAuthDB();
			expect(database).toBeTruthy();
			const coll = await database.collection("system.users");
			expect(coll).toBeTruthy();
			const findResults = await coll.find({}).toArray();
			expect(findResults).toHaveLength(61)
		});
	});

	describe("getCollection", function () {
		it("get collection should succeed", async function () {
			const coll = await db.getCollection(account, "jobs");
			expect(coll).toBeTruthy();
			const findResults = await coll.find({}).toArray();
			expect(findResults).toEqual(goldenJobs);
		});

		it("get collection with incorrect username should be empty", async function () {
			const coll = await db.getCollection("wrong", "jobs");
			expect(coll).toBeTruthy();
			const findResults = await coll.find({}).toArray();
			expect(findResults).toHaveLength(0);
		});
	});

	describe("getCollectionStats", function () {
		it("get collection stats should succeed", async function () {
			const stats = await db.getCollectionStats(account, "jobs");
			expect(stats).toBeTruthy();
		});

		it("get collection stats with incorrect username should be size 0", async function () {
			const stats = await db.getCollectionStats("notexist", "jobs");
			expect(stats).toBeTruthy();
			expect(stats.size).toBe(0);
		});
	});

	describe("listCollections", function () {
		it("list collection with valid username should succeed", async function () {
			const colls = await db.listCollections(account);
			const listOrder = (a, b) => a.name < b.name ? -1 : 1;
			expect(colls.sort(listOrder)).toEqual(goldenColls.sort(listOrder));
		});

		it("list collection with incorrect username should be empty", async function () {
			const colls = await db.listCollections("wrong");
			expect(colls).toHaveLength(0);
		});
	});

	describe("find", function () {
		it("find jobs should succeed", async function () {
			const jobs = await db.find(account, "jobs", {});
			expect(jobs.sort()).toEqual(goldenJobs.sort());
		});

		it("find Architect job should succeed", async function () {
			const jobs = await db.find(account, "jobs", { _id: "Architect" });
			expect(jobs[0]).toEqual(goldenJobs[0]);
		});

		it("find project that doesn't exist should succeed", async function () {
			const projectNames = await db.find(account, "projects", { name: "doesn't exist" }, { _id: 0, name: 1 });
			expect(projectNames).toHaveLength(0);
		});

		it("find issues with multiple conditions should succeed", async function () {
			const query = { creator_role: "Architect", priority: "high" };
			const issues = await db.find(account, `${model}.issues`, query);
			expect(issues).toHaveLength(1);
			expect(issues[0].creator_role).toBe(query.creator_role);
			expect(issues[0].priority).toBe(query.priority);
		});

		it("find projects with projection should succeed", async function () {
			const projectNames = await db.find(account, "projects", {}, { _id: 0, name: 1 });
			expect(projectNames).toEqual(goldenProjectNames);
		});

		it("find settings with sort should succeed", async function () {
			const settings = await db.find(account, "settings", {}, {}, { timestamp: -1 });
			expect(settings[0].name).toBe("Sample_Federation");
			expect(settings[1].name).toBe("Sample_House");
			expect(settings[2].name).toBe("Sample_Tree");
		});

		it("find with incorrect username should be empty", async function () {
			const settings = await db.find("wrong", "settings", {});
			expect(settings).toHaveLength(0);
		});

		it("find with incorrect collection should be empty", async function () {
			const settings = await db.find(account, "wrongOne", {});
			expect(settings).toHaveLength(0);
		});
	});

	describe("findOne", function () {
		it("find one job should succeed", async function () {
			const job = await db.findOne(account, "jobs", { _id: "Architect" });
			expect(job).toEqual(goldenJobs[0]);
		});

		it("find one unspecified job should return first one and succeed", async function () {
			const job = await db.findOne(account, "jobs", {});
			expect(job).toEqual(goldenJobs[0]);
		});

		it("find one project that doesn't exist should succeed", async function () {
			const projectName = await db.findOne(account, "projects", { name: "doesn't exist" }, { _id: 0, name: 1 });
			expect(projectName).toBeNull();
		});

		it("find one issue with multiple conditions should succeed", async function () {
			const query = { creator_role: "Architect", priority: "high" };
			const issue = await db.findOne(account, `${model}.issues`, query);
			expect(issue.creator_role).toBe(query.creator_role);
			expect(issue.priority).toBe(query.priority);
		});

		it("find one project with projection should succeed", async function () {
			const projectName = await db.findOne(account, "projects", {}, { _id: 0, name: 1 });
			expect(projectName).toEqual(goldenProjectNames[0]);
		});

		it("find one setting with sort should succeed", async function () {
			const setting = await db.findOne(account, "settings", {}, {}, { timestamp: -1 });
			expect(setting.name).toBe("Sample_Federation");
		});

		it("find one with incorrect username should be null", async function () {
			const setting = await db.findOne("wrong", "settings", {});
			expect(setting).toBeNull();
		});

		it("find one with incorrect collection should be null", async function () {
			const setting = await db.findOne(account, "wrongOne", {});
			expect(setting).toBeNull();
		});
	});

	describe("count", function () {
		it("count jobs should succeed", async function () {
			const jobs = await db.count(account, "jobs", {});
			expect(jobs).toBe(goldenJobs.length);
		});

		it("count Architect job should succeed", async function () {
			const jobs = await db.count(account, "jobs", { _id: "Architect" });
			expect(jobs).toBe(1);
		});

		it("count project that doesn't exist should succeed", async function () {
			const projectNames = await db.count(account, "projects", { name: "doesn't exist" }, { _id: 0, name: 1 });
			expect(projectNames).toBe(0);
		});

		it("count issues with multiple conditions should succeed", async function () {
			const query = { creator_role: "Architect", priority: "high" };
			const issues = await db.count(account, `${model}.issues`, query);
			expect(issues).toBe(1);
		});

		it("count with incorrect username should succeed", async function () {
			const settings = await db.count("wrong", "settings", {});
			expect(settings).toBe(0);
		});

		it("count with incorrect collection should succeed", async function () {
			const settings = await db.count(account, "wrongOne", {});
			expect(settings).toBe(0);
		});
	});

	describe("insertOne", function () {
		const newJob = {
			_id: "Test Job",
			users: []
		};

		it("insert should succeed", async function () {
			const result = await db.insertOne(account, "jobs", newJob);
			expect(result.acknowledged).toBe(true);
			expect(result.insertedId).toBeTruthy();
			newJobIds.push(result.insertedId);
		});

		it("duplicate insert should fail", async function () {
			try {
				await db.insertOne(account, "jobs", newJob);
				throw {}; // should've failed at previous line
			} catch (err) {
				expect(err.code).toBe(11000);
			}
		});

		it("incorrect username should succeed", async function () {
			const result = await db.insertOne("wrong", "jobs", newJob);
			expect(result.acknowledged).toBe(true);
			expect(result.insertedId).toBeTruthy();
		});

		it("insert without _id should succeed", async function () {
			const result = await db.insertOne(account, "jobs", { users: ["no ID"] });
			expect(result.acknowledged).toBe(true);
			expect(result.insertedId).toBeTruthy();
			newJobIds.push(result.insertedId);
		});
	});

	describe("insertMany", function () {
		const newJobs = [
			{ _id: "Test Job 2", users: [] },
			{ _id: "Test Job 3", users: [] },
			{ _id: "Test Job 4", users: [] },
			{ _id: "Test Job 5", users: [] },
			{ _id: "Test Job 6", users: [] },
			{ _id: "Test Job 7", users: [] },
			{ _id: "Test Job 8", users: [] },
			{ _id: "Test Job 9", users: [] }
		];

		it("insert many should succeed", async function () {
			const result = await db.insertMany(account, "jobs", newJobs);
			expect(result.acknowledged).toBe(true);
			expect(Object.keys(result.insertedIds)).toHaveLength(newJobs.length);
			Object.values(result.insertedIds).forEach((id) => {
				newJobIds.push(id);
			});
		});

		it("duplicate insert many should fail", async function () {
			try {
				await db.insertMany(account, "jobs", newJobs);
				throw {}; // should've failed at previous line
			} catch (err) {
				expect(err.code).toBe(11000);
			}
		});

		it("incorrect username should succeed", async function () {
			const result = await db.insertMany("wrong", "jobs", newJobs);
			expect(result.acknowledged).toBe(true);
			expect(Object.keys(result.insertedIds)).toHaveLength(newJobs.length);
		});

		it("insert without _id should succeed", async function () {
			const result = await db.insertMany(account, "jobs", [
				{ users: ["no ID 1"] },
				{ users: ["no ID 2"] },
				{ users: ["no ID 3"] }
			]);
			expect(result.acknowledged).toBe(true);
			expect(Object.keys(result.insertedIds)).toHaveLength(3);
			Object.values(result.insertedIds).forEach((id) => {
				newJobIds.push(id);
			});
		});
	});

	describe("updateOne", function () {
		it("update one should succeed", async function () {
			const query = { _id: "Test Job" };
			const newData = { $set: { users: ["updateOne"] } };
			const result = await db.updateOne(account, "jobs", query, newData);
			expect(result.acknowledged).toBe(true);
			expect(result.matchedCount).toBe(1);
			expect(result.modifiedCount).toBe(1);
		});

		it("upsert on existing record should succeed", async function () {
			const query = { _id: "Test Job" };
			const newData = { $set: { users: ["updateOne", "updateTwo"] } };
			const result = await db.updateOne(account, "jobs", query, newData, true);
			expect(result.acknowledged).toBe(true);
			expect(result.matchedCount).toBe(1);
			expect(result.modifiedCount).toBe(1);
		});

		it("upsert should succeed", async function () {
			const query = { _id: "updateOne upsert" };
			const newData = { $set: { users: ["updateOne", "updateTwo", "updateThree"] } };
			const result = await db.updateOne(account, "jobs", query, newData, true);
			expect(result.acknowledged).toBe(true);
			expect(result.matchedCount).toBe(0);
			expect(result.modifiedCount).toBe(0);
			expect(result.upsertedId).toBeTruthy();
			newJobIds.push(result.upsertedId);
		});

		it("upsert again should modify existing record", async function () {
			const query = { _id: "updateOne upsert" };
			const newData = { $set: { users: ["uOne", "uTwo", "uThree", "uFour"] } };
			const result = await db.updateOne(account, "jobs", query, newData, true);
			expect(result.acknowledged).toBe(true);
			expect(result.matchedCount).toBe(1);
			expect(result.modifiedCount).toBe(1);
		});
	});

	describe("updateMany", function () {
		it("update many should succeed", async function () {
			const query = { _id: "Test Job 4" };
			const newData = { $set: { users: ["update1"] } };
			const result = await db.updateMany(account, "jobs", query, newData);
			expect(result.acknowledged).toBe(true);
			expect(result.matchedCount).toBe(1);
			expect(result.modifiedCount).toBe(1);
		});

		it("upsert on existing record should succeed", async function () {
			const query = { _id: "Test Job 4" };
			const newData = { $set: { users: ["update1", "update2"] } };
			const result = await db.updateMany(account, "jobs", query, newData, true);
			expect(result.acknowledged).toBe(true);
			expect(result.matchedCount).toBe(1);
			expect(result.modifiedCount).toBe(1);
		});

		it("upsert should succeed", async function () {
			const query = { _id: "updateMany upsert" };
			const newData = { $set: { users: ["update1", "update2", "update3"] } };
			const result = await db.updateMany(account, "jobs", query, newData, true);
			expect(result.acknowledged).toBe(true);
			expect(result.matchedCount).toBe(0);
			expect(result.modifiedCount).toBe(0);
			expect(result.upsertedId).toBeTruthy();
			newJobIds.push(result.upsertedId);
		});

		it("upsert again should modify existing record", async function () {
			const query = { _id: "updateMany upsert" };
			const newData = { $set: { users: ["u1", "u2", "u3", "u4"] } };
			const result = await db.updateMany(account, "jobs", query, newData, true);
			expect(result.acknowledged).toBe(true);
			expect(result.matchedCount).toBe(1);
			expect(result.modifiedCount).toBe(1);
		});

		it("update records should succeed", async function () {
			const query = {};
			const newData = { $set: { users: [] } };
			const result = await db.updateMany(account, "jobs", query, newData);
			expect(result.acknowledged).toBe(true);
			expect(result.matchedCount).toBe(25);
			expect(result.modifiedCount).toBe(9);
		});
	});

	describe("deleteOne", function () {
		it("deleteOne should succeed", async function () {
			const query = { _id: newJobIds.pop() };
			const result = await db.deleteOne(account, "jobs", query);
			expect(result.acknowledged).toBe(true);
			expect(result.deletedCount).toBe(1);
		});

		it("deleteOne non-existent record should succeed", async function () {
			const query = { _id: "notexist" };
			const result = await db.deleteOne(account, "jobs", query);
			expect(result.acknowledged).toBe(true);
			expect(result.deletedCount).toBe(0);
		});

		it("deleteOne with incorrect username should succeed", async function () {
			const query = { _id: "Test Job" };
			const result = await db.deleteOne("wrong", "jobs", query);
			expect(result.acknowledged).toBe(true);
			expect(result.deletedCount).toBe(1);
		});
	});

	describe("findOneAndDelete", function () {
		it("find one and delete should succeed", async function () {
			const query = { _id: newJobIds.pop() };
			const result = await db.findOneAndDelete(account, "jobs", query);
			expect(result).toBeTruthy();
			expect(result._id).toEqual(query._id);
			expect(result.users).toBeTruthy();
		});

		it("with projection should succeed", async function () {
			const query = { _id: newJobIds.pop() };
			const projection = { _id: 1, users: 0 };
			const result = await db.findOneAndDelete(account, "jobs", query, projection);
			expect(result).toBeTruthy();
			expect(result._id).toEqual(query._id);
		});

		it("projecting without ID should succeed", async function () {
			const query = { _id: newJobIds.pop() };
			const projection = { _id: 0, users: 0 };
			const result = await db.findOneAndDelete(account, "jobs", query, projection);
			expect(result).toBeTruthy();
		});

		it("non-existent record should return null", async function () {
			const query = { _id: "notexist" };
			const result = await db.findOneAndDelete(account, "jobs", query);
			expect(result).toBeNull();
		});

		it("non-existent DB should return null", async function () {
			const query = { _id: "Test Job" };
			const result = await db.findOneAndDelete("badDB", "jobs", query);
			expect(result).toBeNull();
		});
	});

	describe("deleteMany", function () {
		it("delete many should succeed", async function () {
			const query = { _id: { $in: newJobIds } };
			await db.deleteMany(account, "jobs", query);
		});

		it("delete many with empty query should succeed", async function () {
			await db.deleteMany("wrong", "jobs", {});
		});

		it("delete many non-existent records should succeed", async function () {
			const query = { _id: { $in: ["Fake Job 1", "Fake Job 2"] } };
			await db.deleteMany(account, "jobs", query);
		});
	});

	describe("dropCollection", function () {
		it("drop collection should succeed", async function () {
			await db.dropCollection(account, "testColl");
		});

		it("drop collection should succeed", async function () {
			await db.dropCollection("wrong", "jobs");
		});

		it("drop non-existent collection should succeed", async function () {
			await db.dropCollection(account, "invalid");
		});
	});

	describe("disconnect", function () {
		it("should succeed", async function () {
			try {
				const database = await db.getDB(account);
				expect(database).toBeTruthy();
				await db.disconnect();
				await database.collection("jobs");
			} catch (err) {
				// Error [MongoError]: Topology was destroyed
				expect(err).toBeTruthy();
			}
		});

		it("dsconnect again should succeed", async function () {
			await db.disconnect();
		});
	});
});
