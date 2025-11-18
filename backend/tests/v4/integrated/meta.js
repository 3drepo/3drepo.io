"use strict";

/**
 *  Copyright (C) 2016 3D Repo Ltd
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
const request = require("supertest");
const expect = require("chai").expect;
const { createAppAsync } = require("../../../src/v4/services/api.js");
const logger = require("../../../src/v4/logger.js");
const systemLogger = logger.systemLogger;
const responseCodes = require("../../../src/v4/response_codes.js");
const C = require("../../../src/v4/constants");
const async = require("async");
const User = require("../../../src/v4/models/user");
const config = require("../../../src/v4/config");
const fs = require("fs");

describe("Metadata", function () {

	const User = require("../../../src/v4/models/user");
	let server;
	let agent;
	let groupUserAgent;
	const username = "metaTest";
	const password = "123456";
	const model = "4d3df6a7-b4d5-4304-a6e1-dc192a761490";
	const model2 = "2fb5635e-f357-410f-a0cd-0df6f1e45a66";
	const oldRevision = "c01daebe-9fe1-452e-a77e-d201280d1fb9";

	const groupUser = "groupUser";
	const groupPassword = "password";
	const groupModel = "4ec71fdd-0450-4b6f-8478-c46633bb66e3";
	const groupFederation = "80bc4290-0f94-11eb-970b-03c55a1e1b3a";

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

		groupUserAgent = SessionTracker(request(server));
		await groupUserAgent.login(groupUser, groupPassword);

	});

	after(function(done) {

		server.close(function() {
			console.log("API test server is closed");
			done();
		});

	});

	it("metadata search of a specific revision should succeed", function(done) {
		const goldenData0 = {
			"_id": "019d575a-189f-4de6-a10c-b5c2efe8afd2",
			"metadata": { "value": "SYSTEM: BRICKS" },
			"parents": [ "a7f7de13-52ae-4caa-9800-dbdf20d100d9" ]
		};

		agent.get(`/${username}/${model}/revision/${oldRevision}/meta/findObjsWith/Category.json`)
			.expect(200, function(err, res) {
				expect(res.body.data).to.exist;
				expect(res.body.data.length).to.equal(659);
				expect(res.body.data[0]).to.deep.equal(goldenData0);
				done(err);
			});
	});

	it("metadata search of head master should succeed", function(done) {
		const goldenData0 = {
			"_id": "007a7b30-b29d-44c8-b571-e2b1cc1a095c",
			"metadata": { "value": "SYSTEM: BRICKS" },
			"parents": [ "916375ad-148a-4eda-a5a9-2b8aa25713ad" ]
		};

		agent.get(`/${username}/${model}/revision/master/head/meta/findObjsWith/Category.json`)
			.expect(200, function(err, res) {
				expect(res.body.data).to.exist;
				expect(res.body.data.length).to.equal(659);
				expect(res.body.data[0]).to.deep.equal(goldenData0);
				done(err);
			});
	});

	it("get metadata by revision tag should succeed", function(done) {
		const goldenData0 = {
			"_id": "019d575a-189f-4de6-a10c-b5c2efe8afd2",
			"metadata": { "value": "SYSTEM: BRICKS" },
			"parents": [ "a7f7de13-52ae-4caa-9800-dbdf20d100d9" ]
		};


		agent.get(`/${username}/${model}/revision/myTag/meta/findObjsWith/Category.json`)
			.expect(200, function(err, res) {
				expect(res.body.data).to.exist;
				expect(res.body.data.length).to.equal(659);
				expect(res.body.data[0]).to.deep.equal(goldenData0);
				done(err);
			});
	});

	it("get metadata of invalid revision should fail", function(done) {
		agent.get(`/${username}/${model}/revision/blahblah123/meta/findObjsWith/Category.json`)
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_TAG_NAME.value);
				done(err);
			});
	});

	it("metadata search of non existent field should succeed", function(done) {
		const goldenData = { "data": [] };

		agent.get(`/${username}/${model}/revision/${oldRevision}/meta/findObjsWith/blahblah.json`)
			.expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenData);
				done(err);
			});
	});

	it("metadata search of a specific revision should succeed", function(done) {
		const goldenData = { "data": [] };

		agent.get(`/${username}/${model}/revision/${oldRevision}/meta/4DTaskSequence.json`)
			.expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenData);
				done(err);
			});
	});

	it("all metadata of head master should succeed", function(done) {
		const goldenData0 = {
			"_id": "007a7b30-b29d-44c8-b571-e2b1cc1a095c",
			"metadata": {
				"IFC Type": "IfcBuildingElementProxy",
				"IFC GUID": "0B97aBkeAuHeytNaMZaPJH",
				"BrickName": "Brick 1X2",
				"Category": "SYSTEM: BRICKS",
				"ColourFamily": "Green",
				"ExactColour": "EARTH GREEN",
				"RGB": "#00451A",
				"ColourType": "Solid",
				"DesignID": 3004,
				"ElementID": 4245570,
				"AppearsIn": "45 Sets",
				"IntroducedIn": 2003,
				"OrderReplacementPart": "http://brickset.com/parts/4245570",
				"LayerName": "A-0140-M_Step40",
				"Meta With, Comma": "Value",
				"BarCode": "n/a",
				"SerialNumber": "n/a",
				"TagNumber": "n/a",
				"AssetIdentifier": "n/a",
				"InstallationDate": "1900-12-31T23:59:59",
				"WarrantyStartDate": "1900-12-31T23:59:59",
				"RequiredForCOBieComponent": "Yes",
				"Comments": "n/a",
				"RenovationStatus": "New",
				"SpecificationType": "n/a",
				"Floor": "GF Ground Floor",
				"Renovation Status": "New",
				"Meta With, Comma": "Value",
			},
			"parents": [ "916375ad-148a-4eda-a5a9-2b8aa25713ad" ]
		};

		agent.get(`/${username}/${model}/revision/master/head/meta/all.json`)
			.expect(200, function(err, res) {
				expect(res.body.data).to.exist;
				expect(res.body.data.length).to.equal(675);
				expect(res.body.data.find(({_id})=> goldenData0._id === _id)).to.deep.equal(goldenData0);
				done(err);
			});
	});

	it("filtered metadata of head master should succeed", function(done) {
		const goldenData0 = {
			"_id": "007a7b30-b29d-44c8-b571-e2b1cc1a095c",
			"metadata": {
				"IFC Type": "IfcBuildingElementProxy",
				"IFC GUID": "0B97aBkeAuHeytNaMZaPJH",
				"Meta With, Comma": "Value",
			},
			"parents": [ "916375ad-148a-4eda-a5a9-2b8aa25713ad" ]
		};

		const filterString = 'filter=IFC%20Type,IFC%20GUID,Meta%20With%2C%20Comma';
		agent.get(`/${username}/${model}/revision/master/head/meta/all.json?${filterString}`)
			.expect(200, function(err, res) {
				expect(res.body.data).to.exist;
				expect(res.body.data.length).to.equal(675);
				expect(res.body.data.find(({_id})=> goldenData0._id === _id)).to.deep.equal(goldenData0);
				done(err);
			});
	});

	it("all metadata of revision tag should succeed", function(done) {
		const goldenData0 = {
			"_id": "0062f1bb-b28e-4be2-a9d7-6f73abcdb760",
			"metadata": {
				"IFC Type": "IfcBuildingElementProxy",
				"IFC GUID": "0WHuICC7qTG8oNFZ9AvcS0",
				"BrickName": "Flat Tile 1X1",
				"Category": "SYSTEM: PLATES",
				"ColourFamily": "Grey",
				"ExactColour": "MEDIUM STONE GREY",
				"RGB": "#969696",
				"ColourType": "Solid",
				"DesignID": 3070,
				"ElementID": 4211415,
				"AppearsIn": "125 Sets",
				"IntroducedIn": 2004,
				"OrderReplacementPart": "http://brickset.com/parts/4211415",
				"LayerName": "A-0116-M_Step16",
				"Meta With, Comma": "Value",
				"BarCode": "n/a",
				"SerialNumber": "n/a",
				"TagNumber": "n/a",
				"AssetIdentifier": "n/a",
				"InstallationDate": "1900-12-31T23:59:59",
				"WarrantyStartDate": "1900-12-31T23:59:59",
				"RequiredForCOBieComponent": "Yes",
				"Comments": "n/a",
				"RenovationStatus": "New",
				"SpecificationType": "n/a",
				"Floor": "Datum / Site Model",
				"Renovation Status": "New",
				"Meta With, Comma": "Value",
			},
			"parents": [ "dba918f9-e065-4f98-921e-ab7c05d89ee5" ]
		};

		agent.get(`/${username}/${model}/revision/myTag/meta/all.json`)
			.expect(200, function(err, res) {
				expect(res.body.data).to.exist;
				expect(res.body.data.length).to.equal(675);
				expect(res.body.data.find(({_id})=> goldenData0._id === _id)).to.deep.equal(goldenData0);
				done(err);
			});
	});

	it("filtered metadata of revision tag should succeed", function(done) {
		const goldenData0 = {
			"_id": "0062f1bb-b28e-4be2-a9d7-6f73abcdb760",
			"metadata": {
				"IFC Type": "IfcBuildingElementProxy",
				"IFC GUID": "0WHuICC7qTG8oNFZ9AvcS0",
				"Meta With, Comma": "Value",
			},
			"parents": [ "dba918f9-e065-4f98-921e-ab7c05d89ee5" ]
		};
		const filterString = 'filter=IFC%20Type,IFC%20GUID,Meta%20With%2C%20Comma';
		agent.get(`/${username}/${model}/revision/myTag/meta/all.json?${filterString}`)
			.expect(200, function(err, res) {
				expect(res.body.data).to.exist;
				expect(res.body.data.length).to.equal(675);
				expect(res.body.data.find(({_id})=> goldenData0._id === _id)).to.deep.equal(goldenData0);
				done(err);
			});
	});

	it("all metadata of non existent revision should fail", function(done) {
		agent.get(`/${username}/${model}/revision/blahblah123/meta/all.json`)
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_TAG_NAME.value);
				done(err);
			});
	});

	it("4D Task Sequence search of head master should succeed", function(done) {
		const goldenData = { "data": [] };

		agent.get(`/${username}/${model}/revision/master/head/meta/4DTaskSequence.json`)
			.expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenData);
				done(err);
			});
	});

	it("4D Task Sequence search of revision tag should succeed", function(done) {
		const goldenData = { "data": [] };

		agent.get(`/${username}/${model}/revision/myTag/meta/4DTaskSequence.json`)
			.expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenData);
				done(err);
			});
	});

	it("4D Task Sequence search of non existent revision should fail", function(done) {
		agent.get(`/${username}/${model}/revision/blahblah123/meta/4DTaskSequence.json`)
			.expect(400, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.INVALID_TAG_NAME.value);
				done(err);
			});
	});

	it("4D Task Sequence search of a model with no Sequence Tag should fail", function(done) {
		agent.get(`/${username}/${model2}/revision/master/head/meta/4DTaskSequence.json`)
			.expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.SEQ_TAG_NOT_FOUND.value);
				done(err);
			});
	});

	it("retrieving metadata by existing ID should succeed", function(done) {
		const goldenData = {
			"meta": [
				{
					"_id": "60fa0851-2fc1-4906-b50d-b9bb9db98db8",
					"name": "ComponentName:201",
					"metadata": {
						"IFC Type": "IfcBuildingElementProxy",
						"IFC GUID": "3O$ka3lHkYIRKSDSO0b9Bc",
						"BrickName": "Brick 1X4",
						"ColourFamily": "Green",
						"ExactColour": "EARTH GREEN",
						"Category": "SYSTEM: BRICKS",
						"ColourType": "Solid",
						"RGB": "#00451A",
						"DesignID": 3010,
						"ElementID": 4245571,
						"AppearsIn": "22 Sets",
						"IntroducedIn": 2005,
						"OrderReplacementPart": "http://brickset.com/parts/4245571",
						"LayerName": "A-0139-M_Step39",
						"BarCode": "n/a",
						"SerialNumber": "n/a",
						"TagNumber": "n/a",
						"AssetIdentifier": "n/a",
						"InstallationDate": "1900-12-31T23:59:59",
						"WarrantyStartDate": "1900-12-31T23:59:59",
						"RequiredForCOBieComponent": "Yes",
						"Comments": "n/a",
						"RenovationStatus": "New",
						"SpecificationType": "n/a",
						"Floor": "GF Ground Floor",
						"Renovation Status": "New"
					}
				}
			]
		};
		agent.get(`/${username}/${model}/meta/60fa0851-2fc1-4906-b50d-b9bb9db98db8.json`)
			.expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenData);
				done(err);
			});
	});

	it("retrieving metadata by non-existing ID should fail", function(done) {
		agent.get(`/${username}/${model}/meta/60fa0851-2fc1-4906-b50d-000000000000.json`)
			.expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.METADATA_NOT_FOUND.value);
				done(err);
			});
	});

	it("retrieving metadata by invalid ID should fail", function(done) {
		agent.get(`/${username}/${model}/meta/dslfkdjslkfjsd.json`)
			.expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.METADATA_NOT_FOUND.value);
				done(err);
			});
	});

	it("retrieving metadata fields should succeed", function(done) {
		const goldenData = [
			"AppearsIn",
			"AssetIdentifier",
			"BarCode",
			"BrickName",
			"BuildingID",
			"Category",
			"CeilingCovering",
			"ColourFamily",
			"ColourType",
			"Comments",
			"ConcealedCeiling",
			"DesignID",
			"ElementID",
			"ExactColour",
			"Floor",
			"Floor Type",
			"FloorCovering",
			"IFC GUID",
			"IFC Type",
			"InstallationDate",
			"IntroducedIn",
			"IsLandmarked",
			"IsPermanentID",
			"LayerName",
			"Meta With, Comma",
			"NumberOfStoreys",
			"OccupancyType",
			"OrderReplacementPart",
			"RGB",
			"RefEasting",
			"RefNorthing",
			"Renovation Status",
			"RenovationStatus",
			"RequiredForCOBieComponent",
			"RoomTag",
			"SerialNumber",
			"SkirtingBoard",
			"SpecificationType",
			"TOID",
			"TagNumber",
			"UPRN",
			"Uniclass - D - Facilities",
			"Uniclass - F - Spaces",
			"Uniclass 2015 - En",
			"Uniclass 2015 - SL",
			"Uniclass2 - En",
			"Uniclass2 - Sp",
			"WallCovering",
			"WarrantyStartDate"
		];

		agent.get(`/${username}/${model}/meta/keys`)
			.expect(200, function(err, res) {
				expect(res.body.sort()).to.deep.equal(goldenData.sort());
				done(err);
			});
	});

	describe("Query with rules", function() {
		const goldenIfcStairFlight = [
			{
				account: "groupUser",
				model: "4ec71fdd-0450-4b6f-8478-c46633bb66e3",
				mesh_ids: [
					"08842866-9e52-490c-a7d3-8f82c5fa36c8",
					"1b59cb25-cc4f-4687-88f7-68f20b7d4660",
					"225744d6-f2e8-43b0-a204-bb6c286956d7",
					"31c0eab5-b2e9-4439-9d63-25b3f14c904a",
					"3ae41768-b022-42e7-b29e-13a56b580d2a",
					"3c5c7d72-6d93-4ae7-8c03-b707bac26902",
					"49c28976-a97e-4dee-ae62-9d19972f0a37",
					"50afd8b2-0d12-48e2-9a97-ec077031d367",
					"67cb101a-8d79-4a99-834f-adb8f0d7be8c",
					"6e157266-9280-486e-858c-35daf77916c0",
					"755c1ae6-517e-4fa9-a8b8-0a4c9f460fe2",
					"789984a9-8132-41fb-9d60-f1c160944e0d",
					"7f532831-57f5-406e-a6be-669657e38aca",
					"8995d54c-a6cd-4f62-a1b4-9737b2286791",
					"8b74b4df-eee6-4732-989e-48c6c73be1df",
					"a9f80cb9-4acb-4329-91b4-3365f16f5fbf",
					"b0b361ba-0fae-49fc-920b-dcdd0301cdef",
					"c6afd43f-7ece-470d-8f26-1faeaec931ec",
					"c819d27d-a919-49b6-89f1-ffeda5b7b0dc",
					"c98a94c5-ede9-47bb-adc1-064578f62a8c",
					"d76481fa-6277-4ac3-a6e1-4f24f3945074",
					"d9fd8065-cb16-4b38-a1ad-0f044510dde7",
					"ea5053ae-0056-48f3-a0ea-5966548ef7b6",
					"f1023c2d-d65e-4083-81ed-e01bcadda794"
				]
			}
		];
		it("retrieving mesh IDs with rule query should succeed", function(done) {
			const query = [
				{
					"field": "IFC Type",
					"operator": "IS",
					"values": ["IfcStairFlight"]
				}
			];

			groupUserAgent.post(`/${groupUser}/${groupModel}/revision/master/head/meta/rules?meshids=true`)
				.send(query)
				.expect(200, function(err, res) {
					res.body[0].mesh_ids.sort();
					goldenIfcStairFlight[0].mesh_ids.sort();
					expect(res.body).to.deep.equal(goldenIfcStairFlight);
					done(err);
				});
		});

		it("with mix of IS and IS_NOT should succeed", function(done) {
			const query = [
				{
					"field":"Name",
					"operator":"IS",
					"values":[
						"Level 3",
						"Level 1"
					]
				},
				{
					"field":"Category",
					"operator":"IS_NOT",
					"values":[
						"Windows"
					]
				}
			];

			groupUserAgent.post(`/${groupUser}/${groupModel}/revision/master/head/meta/rules?meshids=true`)
				.send(query)
				.expect(200, function(err, res) {
					expect(res.body[0].mesh_ids.length).to.equal(200);
					done(err);
				});
		});

		it("retrieving mesh IDs with empty rule query should fail", function(done) {
			const query = [];

			groupUserAgent.post(`/${groupUser}/${groupModel}/revision/master/head/meta/rules?meshids=true`)
				.send(query)
				.expect(400, done);
		});

		it("retrieving metadata with rule query should succeed", function(done) {
			const query = [
				{
					"field": "Area",
					"operator": "GT",
					"values": [1689]
				}
			];

			const goldenData = {
				data: [
					{
						"_id": "d64e734f-6f69-4cf0-9c88-a03af13c49b2",
						"parents": ["ccd7d618-b0de-4517-8ad0-ed597c7de3df"],
						"metadata": {
							"IFC Type": "IfcSlab",
							"IFC GUID": "2Q2l26McTBDwwH2fEWb4mn",
							"IsExternal": "False",
							"LoadBearing": "True",
							"Reference": "Multi_Layer 300mm",
							"Related to Mass": "False",
							"Room Bounding": "True",
							"Level": "Level: Level 1",
							"Height Offset From Level": 0,
							"Area": 1689.080245,
							"Elevation at Bottom": 262717.2,
							"Elevation at Top": 263017.2,
							"Perimeter": 239983.045788,
							"Thickness": 300,
							"Volume": 506.722321,
							"Workset": "Floor Types",
							"Design Option": "Main Model",
							"Category": "Floors",
							"Family": "Floor: Multi_Layer 300mm",
							"Family and Type": "Floor: Multi_Layer 300mm",
							"Type": "Floor: Multi_Layer 300mm",
							"Type Id": "Floor: Multi_Layer 300mm",
							"Phase Created": "New Construction",
							"Enable Analytical Model": "False",
							"Structural": "False",
							"Renovation Status": "New",
							"Roughness": 1,
							"Absorptance": 0.1,
							"Function": "Interior",
							"Default Thickness": 300,
							"Coarse Scale Fill Pattern": "Solid fill",
							"Coarse Scale Fill Color": 12632256,
							"Type Name": "Multi_Layer 300mm",
							"Structural Material": "Concrete - Cast-in-Place Concrete",
							"Family Name": "Floor"
						}
					}
				]
			};

			groupUserAgent.post(`/${groupUser}/${groupModel}/revision/master/head/meta/rules`)
				.send(query)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(goldenData);
					done(err);
				});
		});

		it("retrieving metadata with mix of IS and IS_NOT rule query should succeed", function(done) {
			const query = [
				{
					"field":"Name",
					"operator":"IS",
					"values":[
						"Level 3",
						"Level 1"
					]
				},
				{
					"field":"Elevation",
					"operator":"NOT_EQUALS",
					"values":[ 140275 ]
				}
			];

			const goldenData = {
				"data": [
					{
						"_id": "45f752ac-9ce9-42fd-84e8-464cd522bced",
						"parents": [ "42028730-2c27-4168-ba60-1a47960063d8" ],
						"metadata": {
							"IFC Type": "IfcBuildingStorey",
							"IFC GUID": "1LBtSXG153dAQAvAekJ8hs",
							"AboveGround": "False",
							"Elevation": 133025,
							"Computation Height": 0,
							"Structural": "False",
							"Building Story": "True",
							"Workset": "Level Types",
							"Name": "Level 1",
							"Category": "Levels",
							"Family": "Level: BDP_FFL Head - Shared Datum",
							"Family and Type": "Level: BDP_FFL Head - Shared Datum",
							"Type": "Level: BDP_FFL Head - Shared Datum",
							"Type Id": "Level: BDP_FFL Head - Shared Datum",
							"Elevation Base": "Survey Point",
							"Color": 0,
							"Line Pattern": "AEC_Centre",
							"Line Weight": 1,
							"Symbol": "BDP_LevelHead: BDP_LevelHead",
							"Symbol at End 1 Default": "True",
							"Symbol at End 2 Default": "False",
							"Level_Function": "FFL",
							"Type Name": "BDP_FFL Head - Shared Datum",
							"Family Name": "Level"
						}
					}
				]
			};

			groupUserAgent.post(`/${groupUser}/${groupModel}/revision/master/head/meta/rules`)
				.send(query)
				.expect(200, function(err, res) {
					expect(res.body).to.deep.equal(goldenData);
					done(err);
				});
		});

		it("retrieving metadata with empty rule query should succeed", function(done) {
			const query = [];

			groupUserAgent.post(`/${groupUser}/${groupModel}/revision/master/head/meta/rules`)
				.send(query)
				.expect(200, function(err, res) {
					expect(res.body.data).to.exist;
					expect(res.body.data.length).to.equal(1166);
					done(err);
				});
		});
	});
});
