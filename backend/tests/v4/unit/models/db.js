'use strict';

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

const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

const checkPermission = proxyquire('../../../../src/v4/middlewares/checkPermissions', {
	'./getPermissionsAdapter': {},
	'../response_codes': {},
}).checkPermissionsHelper;
const C = require('../../../../src/v4/constants');
const db = require('../../../../src/v4/handler/db');

const account = 'testuser';
const password = 'testuser';
const newPassword = 'newtestuser';
const model = 'af1ccf84-71c3-490e-9e5a-cb80e30ee519';
const gridFsFilename = 'cd561c86-de1a-482e-8f5d-89cfc49562e8LAB-BBD-00-ZZ-M3-A-0005_IFC2x3_FM_Handover_ifc';

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
	{ _id: 'Admin', color: '#f7f7b2', users: ['testuser'] },
];

const goldenProjectNames = [{ name: 'Sample_Project' }];

const newJobIds = [];

describe('Check DB handler', () => {
	describe('authenticate', () => {
		it('valid credentials should succeed', async () => {
			await db.authenticate(account, password);
		});

		it('incorrect username casing should fail', async () => {
			try {
				await db.authenticate(account.toUpperCase(), password);
				throw {}; // should've failed at previous line
			} catch (err) {
				expect(err).to.be.not.empty;
			}
		});

		it('incorrect password should fail', async () => {
			try {
				await db.authenticate(account, 'badPassword');
				throw {}; // should've failed at previous line
			} catch (err) {
				expect(err).to.be.not.empty;
			}
		});
	});

	describe('getDB', () => {
		it('get DB should succeed', async () => {
			const database = await db.getDB(account);
			expect(database).to.exist;
		});
	});

	describe('getAuthDB', () => {
		it('get auth DB should succeed', async () => {
			const database = await db.getAuthDB();
			expect(database).to.exist;
			const coll = await database.collection('system.users');
			expect(coll).to.exist;
			const findResults = await coll.find({}).toArray();
			expect(findResults).to.have.lengthOf(61);
		});
	});

	describe('getCollection', () => {
		it('get collection should succeed', async () => {
			const coll = await db.getCollection(account, 'jobs');
			expect(coll).to.exist;
			const findResults = await coll.find({}).toArray();
			expect(findResults).to.deep.equal(goldenJobs);
		});

		it('get collection with incorrect username should be empty', async () => {
			const coll = await db.getCollection('wrong', 'jobs');
			expect(coll).to.exist;
			const findResults = await coll.find({}).toArray();
			expect(findResults).to.be.empty;
		});
	});

	describe('getCollectionStats', () => {
		it('get collection stats should succeed', async () => {
			const stats = await db.getCollectionStats(account, 'jobs');
			expect(stats).to.exist;
			expect(stats.ok).to.equal(1);
		});

		it('get collection stats with incorrect username should be size 0', async () => {
			const stats = await db.getCollectionStats('notexist', 'jobs');
			expect(stats).to.exist;
			expect(stats.size).to.equal(0);
		});
	});

	describe('listCollections', () => {
		it('list collection with valid username should succeed', async () => {
			const colls = await db.listCollections(account);
			const listOrder = (a, b) => (a.name < b.name ? -1 : 1);
			expect(colls.sort(listOrder)).to.deep.equal(goldenColls.sort(listOrder));
		});

		it('list collection with incorrect username should be empty', async () => {
			const colls = await db.listCollections('wrong');
			expect(colls).to.be.empty;
		});
	});

	describe('find', () => {
		it('find jobs should succeed', async () => {
			const jobs = await db.find(account, 'jobs', {});
			expect(jobs.sort()).to.deep.equal(goldenJobs.sort());
		});

		it('find Architect job should succeed', async () => {
			const jobs = await db.find(account, 'jobs', { _id: 'Architect' });
			expect(jobs[0]).to.deep.equal(goldenJobs[0]);
		});

		it("find project that doesn't exist should succeed", async () => {
			const projectNames = await db.find(account, 'projects', { name: "doesn't exist" }, { _id: 0, name: 1 });
			expect(projectNames).to.be.empty;
		});

		it('find issues with multiple conditions should succeed', async () => {
			const query = { creator_role: 'Architect', priority: 'high' };
			const issues = await db.find(account, `${model}.issues`, query);
			expect(issues).to.have.lengthOf(1);
			expect(issues[0].creator_role).to.equal(query.creator_role);
			expect(issues[0].priority).to.equal(query.priority);
		});

		it('find projects with projection should succeed', async () => {
			const projectNames = await db.find(account, 'projects', {}, { _id: 0, name: 1 });
			expect(projectNames).to.deep.equal(goldenProjectNames);
		});

		it('find settings with sort should succeed', async () => {
			const settings = await db.find(account, 'settings', {}, {}, { timestamp: -1 });
			expect(settings[0].name).to.equal('Sample_Federation');
			expect(settings[1].name).to.equal('Sample_House');
			expect(settings[2].name).to.equal('Sample_Tree');
		});

		it('find with incorrect username should be empty', async () => {
			const settings = await db.find('wrong', 'settings', {});
			expect(settings).to.be.empty;
		});

		it('find with incorrect collection should be empty', async () => {
			const settings = await db.find(account, 'wrongOne', {});
			expect(settings).to.be.empty;
		});
	});

	describe('findOne', () => {
		it('find one job should succeed', async () => {
			const job = await db.findOne(account, 'jobs', { _id: 'Architect' });
			expect(job).to.deep.equal(goldenJobs[0]);
		});

		it('find one unspecified job should return first one and succeed', async () => {
			const job = await db.findOne(account, 'jobs', {});
			expect(job).to.deep.equal(goldenJobs[0]);
		});

		it("find one project that doesn't exist should succeed", async () => {
			const projectName = await db.findOne(account, 'projects', { name: "doesn't exist" }, { _id: 0, name: 1 });
			expect(projectName).to.be.null;
		});

		it('find one issue with multiple conditions should succeed', async () => {
			const query = { creator_role: 'Architect', priority: 'high' };
			const issue = await db.findOne(account, `${model}.issues`, query);
			expect(issue.creator_role).to.equal(query.creator_role);
			expect(issue.priority).to.equal(query.priority);
		});

		it('find one project with projection should succeed', async () => {
			const projectName = await db.findOne(account, 'projects', {}, { _id: 0, name: 1 });
			expect(projectName).to.deep.equal(goldenProjectNames[0]);
		});

		it('find one setting with sort should succeed', async () => {
			const setting = await db.findOne(account, 'settings', {}, {}, { timestamp: -1 });
			expect(setting.name).to.equal('Sample_Federation');
		});

		it('find one with incorrect username should be null', async () => {
			const setting = await db.findOne('wrong', 'settings', {});
			expect(setting).to.be.null;
		});

		it('find one with incorrect collection should be null', async () => {
			const setting = await db.findOne(account, 'wrongOne', {});
			expect(setting).to.be.null;
		});
	});

	describe('runCommand', () => {
		const roleName = C.DEFAULT_MEMBER_ROLE;
		const createRoleCmd = {
			createRole: roleName,
			privileges: [{
				resource: {
					db: account,
					collection: 'settings',
				},
				actions: ['find'] },
			],
			roles: [],
		};
		const grantRoleCmd = {
			grantRolesToUser: account,
			roles: [{ role: C.DEFAULT_MEMBER_ROLE, db: account }],
		};
		const revokeRoleCmd = {
			revokeRolesFromUser: account,
			roles: [{ role: C.DEFAULT_MEMBER_ROLE, db: account }],
		};
		const newPasswordUserCmd = {
			updateUser: account,
			pwd: newPassword,
		};
		const revertPasswordUserCmd = {
			updateUser: account,
			pwd: password,
		};

		it('create role command should succeed', async () => {
			const result = await db.runCommand(account, createRoleCmd);
			expect(result.ok).to.equal(1);
		});

		it('create duplicate role command should fail', async () => {
			try {
				await db.runCommand(account, createRoleCmd);
				throw {}; // should've failed at previous line
			} catch (err) {
				expect(err.code).to.equal(51002);
			}
		});

		it('grant role command should succeed', async () => {
			const result = await db.runCommand('admin', grantRoleCmd);
			expect(result.ok).to.equal(1);
		});

		it('grant role command to user DB should fail', async () => {
			try {
				await db.runCommand(account, grantRoleCmd);
			} catch (err) {
				expect(err.code).to.equal(11);
			}
		});

		it('revoke role command should succeed', async () => {
			const result = await db.runCommand('admin', revokeRoleCmd);
			expect(result.ok).to.equal(1);
		});

		it('revoke role command on user DB should fail', async () => {
			try {
				await db.runCommand(account, revokeRoleCmd);
			} catch (err) {
				expect(err.code).to.equal(11);
			}
		});

		it('update user password command on admin should succeed', async () => {
			const result = await db.runCommand('admin', newPasswordUserCmd);
			expect(result.ok).to.equal(1);
		});

		it('update user password command on admin should succeed', async () => {
			const result = await db.runCommand('admin', revertPasswordUserCmd);
			expect(result.ok).to.equal(1);
		});

		it('update user command on user DB should fail', async () => {
			try {
				await db.runCommand(account, revertPasswordUserCmd);
				throw {}; // should've failed at previous line
			} catch (err) {
				expect(err.code).to.equal(11);
			}
		});

		it('run command with incorrect username should fail', async () => {
			try {
				await db.runCommand('badDB', revertPasswordUserCmd);
				throw {}; // should've failed at previous line
			} catch (err) {
				expect(err.code).to.equal(11);
			}
		});
	});
	describe('count', () => {
		it('count jobs should succeed', async () => {
			const jobs = await db.count(account, 'jobs', {});
			expect(jobs).to.equal(goldenJobs.length);
		});

		it('count Architect job should succeed', async () => {
			const jobs = await db.count(account, 'jobs', { _id: 'Architect' });
			expect(jobs).to.equal(1);
		});

		it("count project that doesn't exist should succeed", async () => {
			const projectNames = await db.count(account, 'projects', { name: "doesn't exist" }, { _id: 0, name: 1 });
			expect(projectNames).to.equal(0);
		});

		it('count issues with multiple conditions should succeed', async () => {
			const query = { creator_role: 'Architect', priority: 'high' };
			const issues = await db.count(account, `${model}.issues`, query);
			expect(issues).to.equal(1);
		});

		it('count with incorrect username should succeed', async () => {
			const settings = await db.count('wrong', 'settings', {});
			expect(settings).to.equal(0);
		});

		it('count with incorrect collection should succeed', async () => {
			const settings = await db.count(account, 'wrongOne', {});
			expect(settings).to.equal(0);
		});
	});

	describe('insertOne', () => {
		const newJob = {
			_id: 'Test Job',
			users: [],
		};

		it('insert should succeed', async () => {
			const result = await db.insertOne(account, 'jobs', newJob);
			expect(result.result.n).to.equal(1);
			expect(result.result.ok).to.equal(1);
			newJobIds.push(result.ops[0]._id);
		});

		it('duplicate insert should fail', async () => {
			try {
				await db.insertOne(account, 'jobs', newJob);
				throw {}; // should've failed at previous line
			} catch (err) {
				expect(err.code).to.equal(11000);
			}
		});

		it('incorrect username should succeed', async () => {
			const result = await db.insertOne('wrong', 'jobs', newJob);
			expect(result.result.n).to.equal(1);
			expect(result.result.ok).to.equal(1);
		});

		it('insert without _id should succeed', async () => {
			const result = await db.insertOne(account, 'jobs', { users: ['no ID'] });
			expect(result.result.n).to.equal(1);
			expect(result.result.ok).to.equal(1);
			newJobIds.push(result.ops[0]._id);
		});
	});

	describe('insertMany', () => {
		const newJobs = [
			{ _id: 'Test Job 2', users: [] },
			{ _id: 'Test Job 3', users: [] },
			{ _id: 'Test Job 4', users: [] },
			{ _id: 'Test Job 5', users: [] },
			{ _id: 'Test Job 6', users: [] },
			{ _id: 'Test Job 7', users: [] },
			{ _id: 'Test Job 8', users: [] },
			{ _id: 'Test Job 9', users: [] },
		];

		it('insert many should succeed', async () => {
			const result = await db.insertMany(account, 'jobs', newJobs);
			expect(result.result.n).to.equal(newJobs.length);
			expect(result.result.ok).to.equal(1);
			result.ops.forEach((op) => {
				newJobIds.push(op._id);
			});
		});

		it('duplicate insert many should fail', async () => {
			try {
				await db.insertMany(account, 'jobs', newJobs);
				throw {}; // should've failed at previous line
			} catch (err) {
				expect(err.code).to.equal(11000);
			}
		});

		it('incorrect username should succeed', async () => {
			const result = await db.insertMany('wrong', 'jobs', newJobs);
			expect(result.result.n).to.equal(newJobs.length);
			expect(result.result.ok).to.equal(1);
		});

		it('insert without _id should succeed', async () => {
			const result = await db.insertMany(account, 'jobs', [
				{ users: ['no ID 1'] },
				{ users: ['no ID 2'] },
				{ users: ['no ID 3'] },
			]);
			expect(result.result.n).to.equal(3);
			expect(result.result.ok).to.equal(1);
			result.ops.forEach((op) => {
				newJobIds.push(op._id);
			});
		});
	});

	describe('updateOne', () => {
		it('update one should succeed', async () => {
			const query = { _id: 'Test Job' };
			const newData = { $set: { users: ['updateOne'] } };
			const result = await db.updateOne(account, 'jobs', query, newData);
			expect(result.result.n).to.equal(1);
			expect(result.result.nModified).to.equal(1);
			expect(result.result.ok).to.equal(1);
		});

		it('upsert on existing record should succeed', async () => {
			const query = { _id: 'Test Job' };
			const newData = { $set: { users: ['updateOne', 'updateTwo'] } };
			const result = await db.updateOne(account, 'jobs', query, newData, true);
			expect(result.result.n).to.equal(1);
			expect(result.result.nModified).to.equal(1);
			expect(result.result.ok).to.equal(1);
		});

		it('upsert should succeed', async () => {
			const query = { _id: 'updateOne upsert' };
			const newData = { $set: { users: ['updateOne', 'updateTwo', 'updateThree'] } };
			const result = await db.updateOne(account, 'jobs', query, newData, true);
			expect(result.result.n).to.equal(1);
			expect(result.result.nModified).to.equal(0);
			expect(result.result.ok).to.equal(1);
			newJobIds.push(result.result.upserted[0]._id);
		});

		it('upsert again should modify existing record', async () => {
			const query = { _id: 'updateOne upsert' };
			const newData = { $set: { users: ['uOne', 'uTwo', 'uThree', 'uFour'] } };
			const result = await db.updateOne(account, 'jobs', query, newData, true);
			expect(result.result.n).to.equal(1);
			expect(result.result.nModified).to.equal(1);
			expect(result.result.ok).to.equal(1);
		});
	});

	describe('updateMany', () => {
		it('update many should succeed', async () => {
			const query = { _id: 'Test Job 4' };
			const newData = { $set: { users: ['update1'] } };
			const result = await db.updateMany(account, 'jobs', query, newData);
			expect(result.result.n).to.equal(1);
			expect(result.result.nModified).to.equal(1);
			expect(result.result.ok).to.equal(1);
		});

		it('upsert on existing record should succeed', async () => {
			const query = { _id: 'Test Job 4' };
			const newData = { $set: { users: ['update1', 'update2'] } };
			const result = await db.updateMany(account, 'jobs', query, newData, true);
			expect(result.result.n).to.equal(1);
			expect(result.result.nModified).to.equal(1);
			expect(result.result.ok).to.equal(1);
		});

		it('upsert should succeed', async () => {
			const query = { _id: 'updateMany upsert' };
			const newData = { $set: { users: ['update1', 'update2', 'update3'] } };
			const result = await db.updateMany(account, 'jobs', query, newData, true);
			expect(result.result.n).to.equal(1);
			expect(result.result.nModified).to.equal(0);
			expect(result.result.ok).to.equal(1);
			newJobIds.push(result.result.upserted[0]._id);
		});

		it('upsert again should modify existing record', async () => {
			const query = { _id: 'updateMany upsert' };
			const newData = { $set: { users: ['u1', 'u2', 'u3', 'u4'] } };
			const result = await db.updateMany(account, 'jobs', query, newData, true);
			expect(result.result.n).to.equal(1);
			expect(result.result.nModified).to.equal(1);
			expect(result.result.ok).to.equal(1);
		});

		it('update records should succeed', async () => {
			const query = {};
			const newData = { $set: { users: [] } };
			const result = await db.updateMany(account, 'jobs', query, newData);
			expect(result.result.n).to.equal(25);
			expect(result.result.nModified).to.equal(9);
			expect(result.result.ok).to.equal(1);
		});
	});

	describe('deleteOne', () => {
		it('deleteOne should succeed', async () => {
			const query = { _id: newJobIds.pop() };
			const result = await db.deleteOne(account, 'jobs', query);
			expect(result.result.n).to.equal(1);
			expect(result.result.ok).to.equal(1);
		});

		it('deleteOne non-existent record should succeed', async () => {
			const query = { _id: 'notexist' };
			const result = await db.deleteOne(account, 'jobs', query);
			expect(result.result.n).to.equal(0);
			expect(result.result.ok).to.equal(1);
		});

		it('deleteOne with incorrect username should succeed', async () => {
			const query = { _id: 'Test Job' };
			const result = await db.deleteOne('wrong', 'jobs', query);
			expect(result.result.n).to.equal(1);
			expect(result.result.ok).to.equal(1);
		});
	});

	describe('findOneAndDelete', () => {
		it('find one and delete should succeed', async () => {
			const query = { _id: newJobIds.pop() };
			const result = await db.findOneAndDelete(account, 'jobs', query);
			expect(result._id).to.deep.equal(query._id);
			expect(result.users).to.exist;
		});

		it('with projection should succeed', async () => {
			const query = { _id: newJobIds.pop() };
			const projection = { _id: 1, users: 0 };
			const result = await db.findOneAndDelete(account, 'jobs', query, projection);
			expect(result._id).to.deep.equal(query._id);
			expect(result.users).to.exist;
		});

		it('projecting without ID should succeed', async () => {
			const query = { _id: newJobIds.pop() };
			const projection = { _id: 0, users: 0 };
			const result = await db.findOneAndDelete(account, 'jobs', query, projection);
			expect(result._id).to.deep.equal(query._id);
			expect(result.users).to.exist;
		});

		it('non-existent record should return null', async () => {
			const query = { _id: 'notexist' };
			const result = await db.findOneAndDelete(account, 'jobs', query);
			expect(result).to.be.null;
		});

		it('non-existent DB should return null', async () => {
			const query = { _id: 'Test Job' };
			const result = await db.findOneAndDelete('badDB', 'jobs', query);
			expect(result).to.be.null;
		});
	});

	describe('deleteMany', () => {
		it('delete many should succeed', async () => {
			const query = { _id: { $in: newJobIds } };
			await db.deleteMany(account, 'jobs', query);
		});

		it('delete many with empty query should succeed', async () => {
			await db.deleteMany('wrong', 'jobs', {});
		});

		it('delete many non-existent records should succeed', async () => {
			const query = { _id: { $in: ['Fake Job 1', 'Fake Job 2'] } };
			await db.deleteMany(account, 'jobs', query);
		});
	});

	describe('dropCollection', () => {
		it('drop collection should succeed', async () => {
			await db.dropCollection(account, 'testColl');
		});

		it('drop collection should succeed', async () => {
			await db.dropCollection('wrong', 'jobs');
		});

		it('drop non-existent collection should succeed', async () => {
			await db.dropCollection(account, 'invalid');
		});
	});

	describe('disconnect', () => {
		it('should succeed', async () => {
			try {
				const database = await db.getDB(account);
				expect(database).to.exist;
				await db.disconnect();
				await database.collection('jobs');
			} catch (err) {
				// Error [MongoError]: Topology was destroyed
				expect(err).to.exist;
			}
		});

		it('dsconnect again should succeed', async () => {
			await db.disconnect();
		});
	});
});
