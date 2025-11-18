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

const SessionTracker = require("../../v4/helpers/sessionTracker")
const { queue: {purgeQueues}} = require("../../v5/helper/services");
const request = require("supertest");
const expect = require("chai").expect;
const { createAppAsync } = require("../../../src/v4/services/api.js");

describe("JSON Assets", function () {
	let server;
	let agent;
	let modelId;

	describe("ID Map/to Mesh/to Path", function() {
		const username = "teamSpace1";
		const password = "password";
		const existingModel = "5bfc11fa-50ac-b7e7-4328-83aa11fa50ac";
		const revId = "b74ba13b-71db-4fcc-9ff8-7f640aa3dec2";

		before(async function() {
			const app = await createAppAsync();
			await new Promise((resolve) => {
				server = app.listen(8080, () => {
					console.log("API test server is listening on port 8080!");
					resolve();
				});
			});

			agent = SessionTracker(request(server));
			await agent.login(username, password);

		});

		after(function(done) {
			purgeQueues().then(() => {
				server.close(function() {
					console.log("API test server is closed");
					done();
				});
			});
		});

		const idLength = 1190;

		it("get ID map should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/master/head/idMap.json`)
				.expect(200, function(err, res) {
					expect(res.body.mainTree).to.exist;
					expect(res.body.mainTree.idMap).to.exist;
					expect(Object.keys(res.body.mainTree.idMap)).to.have.lengthOf(idLength);
					done(err);
				});
		});

		it("get ID map with revision should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/${revId}/idMap.json`)
				.expect(200, function(err, res) {
					expect(res.body.mainTree).to.exist;
					expect(res.body.mainTree.idMap).to.exist;
					expect(Object.keys(res.body.mainTree.idMap)).to.have.lengthOf(idLength);
					done(err);
				});
		});

		it("get ID to meshes should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/master/head/idToMeshes.json`)
				.expect(200, function(err, res) {
					expect(res.body.mainTree).to.exist;
					expect(Object.keys(res.body.mainTree)).to.have.lengthOf(idLength);
					done(err);
				});
		});

		it("get ID to meshes with revision should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/${revId}/idToMeshes.json`)
				.expect(200, function(err, res) {
					expect(res.body.mainTree).to.exist;
					expect(Object.keys(res.body.mainTree)).to.have.lengthOf(idLength);
					done(err);
				});
		});

		it("get tree paths should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/master/head/tree_path.json`)
				.expect(200, function(err, res) {
					expect(res.body.mainTree).to.exist;
					expect(res.body.mainTree.idToPath).to.exist;
					expect(Object.keys(res.body.mainTree.idToPath)).to.have.lengthOf(idLength);
					done(err);
				});
		});

		it("get tree paths with revision should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/${revId}/tree_path.json`)
				.expect(200, function(err, res) {
					expect(res.body.mainTree).to.exist;
					expect(res.body.mainTree.idToPath).to.exist;
					expect(Object.keys(res.body.mainTree.idToPath)).to.have.lengthOf(idLength);
					done(err);
				});
		});
	});

	describe("Tree", function() {
		const username = "project_username";
		const password = "project_username";
		const existingModel = "58de3562-6755-44cf-90f4-860b20bb73b5";
		const revId = "f0fd8f0c-06e2-479b-b41a-a8873bc74dc9";
		const existingFed = "b667ab4c-7e71-4db9-9f85-cb81437aaf43";

		before(async function() {
			await new Promise((resolve) => {
				server = app.listen(8080, () => {
					console.log("API test server is listening on port 8080!");
					resolve();
				});
			});

			agent = SessionTracker(request(server));
			await agent.login(username, password);

		});


		after(function(done) {
			purgeQueues().then(() => {
				server.close(function() {
					console.log("API test server is closed");
					done();
				});
			});
		});
		const goldenFullTree = {
			mainTree: {
				nodes: {
					account: "project_username",
					project: "58de3562-6755-44cf-90f4-860b20bb73b5",
					type: "transformation",
					name: "Default",
					path: "79abdcdf-0bc3-4231-877d-0f52940cf313",
					_id: "79abdcdf-0bc3-4231-877d-0f52940cf313",
					shared_id: "6255829e-d2d9-42a2-98ef-5686f96ef098",
					children: [
						{
							account: "project_username",
							project: "58de3562-6755-44cf-90f4-860b20bb73b5",
							type: "transformation",
							name: "(IfcBuilding)",
							path: "79abdcdf-0bc3-4231-877d-0f52940cf313__9aba7d8c-b74f-43ea-ad4a-9a8568855fb1",
							_id: "9aba7d8c-b74f-43ea-ad4a-9a8568855fb1",
							shared_id: "6d797609-3075-47d7-9bf2-404265334570",
							children: [{
								account: "project_username",
								project: "58de3562-6755-44cf-90f4-860b20bb73b5",
								type: "transformation",
								name: "Datum / Site Model",
								path: "79abdcdf-0bc3-4231-877d-0f52940cf313__9aba7d8c-b74f-43ea-ad4a-9a8568855fb1__f730c223-6a81-450b-ab71-d06a2e355163",
								_id: "f730c223-6a81-450b-ab71-d06a2e355163",
								shared_id: "5e6a3450-b037-4985-8530-da3947a18a02",
								children: [{
									account: "project_username",
									project: "58de3562-6755-44cf-90f4-860b20bb73b5",
									type: "mesh",
									name: "LegoRoundTree:LegoRoundTree:302403",
									path: "79abdcdf-0bc3-4231-877d-0f52940cf313__9aba7d8c-b74f-43ea-ad4a-9a8568855fb1__f730c223-6a81-450b-ab71-d06a2e355163__d4c277e7-aa4a-4240-b600-b53cda81ebb1",
									_id: "d4c277e7-aa4a-4240-b600-b53cda81ebb1",
									shared_id: "03e8eda3-2023-49c3-bfec-bc5b7883f425",
									meta: [ "4f677dbc-08af-4b69-9141-99c63b3fca9c" ],
									toggleState: "visible"
								}],
								meta: [ "fb7dcfc7-7ea1-4ddc-9e63-74cbee29a710" ],
								toggleState: "visible"
							}],
							meta: [ "3cf79748-bb90-4894-83ed-5ea396c106e3" ],
							toggleState: "visible"
						}
					],
					meta: [ "b53cae95-49a3-4cc6-b92a-49d530c01bec" ],
					toggleState: "parentOfInvisible"
				},
				idToName: {
					"d4c277e7-aa4a-4240-b600-b53cda81ebb1": "LegoRoundTree:LegoRoundTree:302403",
					"9aba7d8c-b74f-43ea-ad4a-9a8568855fb1": "(IfcBuilding)",
					"f730c223-6a81-450b-ab71-d06a2e355163": "Datum / Site Model",
					"79abdcdf-0bc3-4231-877d-0f52940cf313": "Default"
				},
				idToPath: {
					"d4c277e7-aa4a-4240-b600-b53cda81ebb1":
					"79abdcdf-0bc3-4231-877d-0f52940cf313__9aba7d8c-b74f-43ea-ad4a-9a8568855fb1__f730c223-6a81-450b-ab71-d06a2e355163__d4c277e7-aa4a-4240-b600-b53cda81ebb1",
					"9aba7d8c-b74f-43ea-ad4a-9a8568855fb1":
					"79abdcdf-0bc3-4231-877d-0f52940cf313__9aba7d8c-b74f-43ea-ad4a-9a8568855fb1",
					"f730c223-6a81-450b-ab71-d06a2e355163":
					"79abdcdf-0bc3-4231-877d-0f52940cf313__9aba7d8c-b74f-43ea-ad4a-9a8568855fb1__f730c223-6a81-450b-ab71-d06a2e355163",
					"79abdcdf-0bc3-4231-877d-0f52940cf313": "79abdcdf-0bc3-4231-877d-0f52940cf313"
				}
			},
			subTrees: []
		};

		it("get tree should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/master/head/fulltree.json`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(goldenFullTree);
					done(err);
				});
		});

		it("get tree with revision should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/${revId}/fulltree.json`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(goldenFullTree);
					done(err);
				});
		});

		const goldenFedTree = {
			mainTree: {
				nodes: {
					account: "project_username",
					project: "b667ab4c-7e71-4db9-9f85-cb81437aaf43",
					name: "Sample_Federation",
					path: "2c7be33a-cb74-54d9-b9fd-f920cb330230",
					_id: "2c7be33a-cb74-54d9-b9fd-f920cb330230",
					shared_id: "d44c4085-b9ef-5a00-bfa7-8e52f4a5f587",
					type: "transformation",
					children: [
						{
							account: "project_username",
							project: "b667ab4c-7e71-4db9-9f85-cb81437aaf43",
							type: "ref",
							name: "2d4a6208-6847-4a25-9d9e-097a63f2de93",
							path: "2c7be33a-cb74-54d9-b9fd-f920cb330230__a0c0ccc0-2446-53f3-b9da-f5c90d8e2259",
							_id: "a0c0ccc0-2446-53f3-b9da-f5c90d8e2259",
							shared_id: "1e8f24fa-ce1b-5ac8-9fd9-6b16d0a6d0b8",
							toggleState: "visible"
						},
						{
							account: "project_username",
							project: "b667ab4c-7e71-4db9-9f85-cb81437aaf43",
							type: "ref",
							name: "58de3562-6755-44cf-90f4-860b20bb73b5",
							path: "2c7be33a-cb74-54d9-b9fd-f920cb330230__dd719680-fc63-5ab7-9b63-c6c4b6763935",
							_id: "dd719680-fc63-5ab7-9b63-c6c4b6763935",
							shared_id: "54949b51-38c9-5080-b39e-a36f21fa790d",
							toggleState: "visible"
						}
					]
				},
				idToName: {
					"2c7be33a-cb74-54d9-b9fd-f920cb330230": "Sample_Federation",
					"a0c0ccc0-2446-53f3-b9da-f5c90d8e2259": "2d4a6208-6847-4a25-9d9e-097a63f2de93",
					"dd719680-fc63-5ab7-9b63-c6c4b6763935": "58de3562-6755-44cf-90f4-860b20bb73b5"
				}
			},
			subTrees: [
				{
					_id: "a0c0ccc0-2446-53f3-b9da-f5c90d8e2259",
					rid: "cd561c86-de1a-482e-8f5d-89cfc49562e8",
					teamspace: "project_username",
					model: "2d4a6208-6847-4a25-9d9e-097a63f2de93",
					url: "/project_username/2d4a6208-6847-4a25-9d9e-097a63f2de93/revision/cd561c86-de1a-482e-8f5d-89cfc49562e8/fulltree.json"
				},
				{
					_id: "dd719680-fc63-5ab7-9b63-c6c4b6763935",
					rid: "f0fd8f0c-06e2-479b-b41a-a8873bc74dc9",
					teamspace: "project_username",
					model: "58de3562-6755-44cf-90f4-860b20bb73b5",
					url: "/project_username/58de3562-6755-44cf-90f4-860b20bb73b5/revision/f0fd8f0c-06e2-479b-b41a-a8873bc74dc9/fulltree.json"
				}
			]
		};

		it("get tree from federation should succeed", function(done) {
			agent.get(`/${username}/${existingFed}/revision/master/head/fulltree.json`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(goldenFedTree);
					done(err);
				});
		});
	});

	describe("Model Properties", function() {
		const username = "project_username";
		const password = "project_username";
		const existingModel = "58de3562-6755-44cf-90f4-860b20bb73b5";
		const revId = "f0fd8f0c-06e2-479b-b41a-a8873bc74dc9";
		const existingFed = "b667ab4c-7e71-4db9-9f85-cb81437aaf43";

		before(async function() {
			await new Promise((resolve) => {
				server = app.listen(8080, () => {
					console.log("API test server is listening on port 8080!");
					resolve();
				});
			});

			agent = SessionTracker(request(server));
			await agent.login(username, password);

		});

		after(function(done) {
			purgeQueues().then(() => {
				server.close(function() {
					console.log("API test server is closed");
					done();
				});
			});
		});

		const goldenModelProps = { properties: { hiddenNodes: [] }, subModels: [] };

		it("get model properties should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/master/head/modelProperties.json`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(goldenModelProps);
					done(err);
				});
		});

		it("get model properties with revision should succeed", function(done) {
			agent.get(`/${username}/${existingModel}/revision/${revId}/modelProperties.json`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(goldenModelProps);
					done(err);
				});
		});

		const goldenFedProps = {
			properties: { hiddenNodes: [] },
			subModels: [
				{
					account: "project_username",
					model: "2d4a6208-6847-4a25-9d9e-097a63f2de93",
					hiddenNodes: [
						"a9014353-c563-4c8a-a641-b1b2bbcaa5c0",
						"c52f9bf0-0517-4f7a-979f-d815d0068c7e",
						"8619f67f-93ef-4ada-8cc8-2e72d4e21e3f",
						"a44e3ec3-928a-4d10-820a-0ec01b15e94d",
						"7cd728f3-0a22-45d6-9ca9-20e04c201942",
						"332f4f47-5d7f-420a-8b8b-b88bf36d9f7d",
						"67ae80b5-86fa-4926-adc3-a15c3c40875f",
						"c751a2bd-ff47-46d3-888a-46153e5939ac",
						"d556eae2-bebc-4000-9bed-ce79d823d99d",
						"3ee852e1-9125-49a8-875b-631b6120eb33"
					]
				}
			]
		};

		it("get model properties of federation should succeed", function(done) {
			agent.get(`/${username}/${existingFed}/revision/master/head/modelProperties.json`)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(goldenFedProps);
					done(err);
				});
		});
	});

	describe("MPC", function() {
		const username = "project_username";
		const password = "project_username";
		const existingModel = "58de3562-6755-44cf-90f4-860b20bb73b5";

		before(async function() {
			await new Promise((resolve) => {
				server = app.listen(8080, () => {
					console.log("API test server is listening on port 8080!");
					resolve();
				});
			});

			agent = SessionTracker(request(server));
			await agent.login(username, password);

		});

		after(function(done) {
			purgeQueues().then(() => {
				server.close(function() {
					console.log("API test server is closed");
					done();
				});
			});
		});
		it("get JSON MPC should succeed", function(done) {
			const mpcId = "fafca0a1-be32-4326-b922-9987915f3ca0_unity";

			agent.get(`/${username}/${existingModel}/${mpcId}.json.mpc`)
				.expect(200, function(err, res) {
					expect(res.body.numberOfIDs).to.equal(1);
					expect(res.body.maxGeoCount).to.equal(1);
					expect(res.body.mapping).to.exist;
					done(err);
				});
		});
	});
});
