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

"use strict";

const request = require("supertest");
const expect = require("chai").expect;
const app = require("../../services/api.js").createApp();
const responseCodes = require("../../response_codes.js");
const async = require("async");

describe("Sequences", function () {

	let server;
	let agent;

	const username = "metaTest";
	const userApiKey = "d3900e3d5f81b13af626579ec1ead4a9";

	const viewerApiKey = "ba7a87507986da2619fc448cae0d93e4";

	const model = "4d3df6a7-b4d5-4304-a6e1-dc192a761490";
	const oldRevision = "c01daebe-9fe1-452e-a77e-d201280d1fb9";

	const federation = "fd7c1390-33d1-11ea-b3c9-d5b471b15ad0";

	const latestGoldenData = {
		"_id":"fe5f4826-817a-42f9-9a94-799e8246e4aa",
		"teamspace":username,
		"model":model,
		"rev_id":"33f63801-37a8-4ea9-abbc-6b6cec07b568",
		"name":"Sequence 2",
		"frames":[
			{
				"dateTime":1446624000000,
				"state":"3b4375cf-bf16-4602-87e6-f8e95aff39c3"
			},
			{
				"dateTime":1446656400000,
				"state":"3b4375cf-bf16-4602-87e6-f8e95aff39c3"
			},
			{
				"dateTime":1446710400000,
				"state":"53c3fc3e-3141-4cd6-b323-406a116734ee"
			},
			{
				"dateTime":1446742800000,
				"state":"53c3fc3e-3141-4cd6-b323-406a116734ee"
			},
			{
				"dateTime":1446796800000,
				"state":"c58adf37-7694-4b5d-8a46-0be123014460"
			}
		]
	};

	const oldGoldenData = {
		"_id":"8a64539a-c78f-41f4-8e9e-29034dc6c293",
		"teamspace":username,
		"model":model,
		"rev_id":oldRevision,
		"name":"Sequence 1",
		"frames":[
			{
				"dateTime":1446624000000,
				"state":"3b4375cf-bf16-4602-87e6-f8e95aff39c3"
			},
			{
				"dateTime":1446656400000,
				"state":"3b4375cf-bf16-4602-87e6-f8e95aff39c3"
			},
			{
				"dateTime":1446710400000,
				"state":"53c3fc3e-3141-4cd6-b323-406a116734ee",
			}
		]
	};

	const customGoldenData = {
		"_id":"4ddbe3e0-826b-11eb-8137-17014c88d41b",
		"teamspace":username,
		"model":model,
		"customSequence":true,
		"name":"Custom Sequence",
		"frames":[
			{
				"dateTime":1446624000000,
				"viewpoint":{
					"up":[0,1,0],
					"position":[38,38 ,125.080119148101],
					"look_at":[0,0,-163.080119148101],
					"view_dir":[0,0,-1],
					"right":[1,0,0],
					"fov":2.11248306530104,
					"aspect_ratio":0.875018933732738,
					"far":276.756120771945,
					"near":76.4241101223321
				}
			},
			{
				"dateTime":1446710400000,
				"viewpoint":{
					"up":[0,1,0],
					"position":[30,35,100],
					"look_at":[0,0,-150],
					"view_dir":[0,0,-1],
					"right":[1,0,0],
					"fov":2.11248306530104,
					"aspect_ratio":0.875018933732738,
					"far":276.756120771945,
					"near":76.4241101223321
				}
			}
		]
	};

	const goldenActivityDetail = {
		"_id":"abdd5f6f-77d1-4310-8a5c-7a81cf9de045",
		"name":"Main Site Compound",
		"parents":["b7b025f2-9e0d-4677-920a-342ca363e587"],
		"data":{
			"Name":"Main Site Compound",
			"Status":"PLANNED",
			"Is Compound Task":"Yes",
			"Code":"ST00150",
			"Planned Start":"30 Apr 2020 10:00:00",
			"Type":"WORK",
			"Constraint":"No Constraint",
			"Planned Finish":"11 Sep 2020 18:00:00",
			"Percentage Complete":0,
			"Physical Volume Unity":"Unknown",
			"Estimated Rate":0,
			"Planned Physical Volume":0,
			"Actual Physical Volume":0,
			"Remaining Physical Volume":0,
			"Budgeted Cost":0,
			"Actual Cost":0
		}
	};

	const goldenActivity = {
		"tasks":[
			{
				"id":"e8cc4f69-9c94-46b3-9656-73ede938f5bf",
				"name":"CONSTRUCTION",
				"startDate":1586941200000,
				"endDate":1599843600000,
				"subTasks":[
					{
						"id":"b7c0796d-df81-4e09-9b6e-37796fd00ae3",
						"name":"Temporary Office & Compound",
						"startDate":1586941200000,
						"endDate":1597766400000,
						"subTasks":[
							{"id":"dbf9ba49-0292-467f-a31e-7822a0d63836","name":"Strip Top Soil in Area for Site Set Up","startDate":1586941200000,"endDate":1587052800000},
							{"id":"13f02902-e350-4580-b577-e5a385962d03","name":"Set Up Heras Fencing for Site Compound","startDate":1586941200000,"endDate":1587135600000},
							{"id":"f1cc0ddf-1fa5-410b-9292-10ed3e20598a","name":"AQV Compound Duration","startDate":1586941200000,"endDate":1597766400000},
							{"id":"1879b1d7-e080-419b-8c51-da4ec31370c8","name":"Excavate Out to Widen Access Road","startDate":1587373200000,"endDate":1587484800000},
							{"id":"3ba601c6-39bd-470f-968b-34301f473e97","name":"Stone Up Site Compund & Access Road","startDate":1587459600000,"endDate":1587654000000},
							{"id":"c378b194-cff6-44ed-9d16-47f741812dfc","name":"Set Up gate Security Cabin","startDate":1587718800000,"endDate":1587747600000},
							{"id":"f821036e-9c9c-4410-bb2a-7396871099cf","name":"Offload Site Cabins","startDate":1587718800000,"endDate":1588003200000},
							{"id":"6e0e07c5-febe-44e8-8088-90d5f1c12af1","name":"Demob","startDate":1587718800000,"endDate":1597312860000},
							{"id":"1cfab6df-92e0-4feb-a409-6c7a3273aa74","name":"Offload Generator, Diesel Tank & Water Boweser","startDate":1588064400000,"endDate":1588093200000},
							{"id":"70daefd8-489e-42b2-ae65-9fd80339e316","name":"Wire Up Site Cabins","startDate":1588064400000,"endDate":1588176000000}
						]
					},
					{
						"id":"cdadc91b-8050-4fbb-beac-faed568da929",
						"name":"Main Site Compound",
						"startDate":1588237200000,
						"endDate":1599843600000,
						"subTasks":[
							{"id":"2c3299ec-761a-43b7-afb3-3c5c296fd3bc",
								"name":"Initial Compound Set Up",
								"startDate":1588237200000,
								"endDate":1591117200000,
								"subTasks":[
									{"id":"aeec3a5b-8eee-4208-a525-b5892248291e","name":"Strip and Load Topsoil Type 4 to South Stockpile Area (1000m2)","startDate":1588237200000,"endDate":1588604400000},
									{"id":"78827462-ff0c-4378-bbc5-db3f668fa641","name":"Strip and Load Topsoil Type 5 to East Stockpile Area (16000m2)","startDate":1588669200000,"endDate":1589367600000},
									{"id":"5f936b62-04c3-4ef6-92cd-eb7cb82d429b","name":"Localised Cut \/ Fill Level & Compact Formation (Possible 1260m3 Short Fall)","startDate":1589274000000,"endDate":1589385600000},
									{"id":"5edd587b-ce32-42cb-acc9-cc725eb39250","name":"Import & Lay Type 1","startDate":1589360400000,"endDate":1590674400000},
									{"id":"f342732a-3c9b-4d6a-859c-185952c1f767","name":"Set Out Different Construction Areas (Access Road) & Trim Access Roads","startDate":1590483600000,"endDate":1590678000000},
									{"id":"a745267e-65a8-4a99-acfd-b11694ca87ac","name":"Testing","startDate":1590742800000,"endDate":1591027200000},
									{"id":"a0c3a466-23c5-4c56-8c4a-01b96fff8688","name":"Survey of Finished Levels & Area Handover","startDate":1591088400000,"endDate":1591117200000}
								]
							},
							{"id":"1009df7e-8747-473b-b875-f2c9f4413f09",
								"name":"Surface Water Drainage",
								"startDate":1591002000000,
								"endDate":1593522000000,
								"subTasks":[
									{"id":"056bdc99-da68-4a43-8288-388f071c7042","name":"Carrier Pipes - 291mts","startDate":1591002000000,"endDate":1591783200000},
									{"id":"d0c6d63a-d790-4965-8bb8-7bc47912faa4","name":"Filter Carrier Pipe - 381mts","startDate":1591002000000,"endDate":1591894800000},
									{"id":"7bc7274d-0faf-4a98-89f3-2287ecddca68","name":"Chambers - 6 No.","startDate":1591866000000,"endDate":1592902800000},
									{"id":"1210bed1-ef97-40a8-b3a1-8daf0a577824","name":"Rodding Eye - 5 No.","startDate":1592989200000,"endDate":1593018000000},
									{"id":"94ef3044-f290-4e80-8b94-a6a9822fbdb9","name":"V-Ditch","startDate":1592989200000,"endDate":1593183600000},
									{"id":"8b74bda3-5f68-424f-84b5-c7bbf4ae8e52","name":"Oil Interceptor 7m * 2m * 1.5m Capture 30,000 m2","startDate":1592989200000,"endDate":1593522000000},
									{"id":"9b203369-ae45-417c-8a0a-1e8bbee8ee77","name":"Head Wall","startDate":1593421200000,"endDate":1593450000000}
								]
							},
							{
								"id":"0d619523-1f32-423e-a80a-0570a83cb515",
								"name":"Foul Water Drainage",
								"startDate":1591002000000,
								"endDate":1593532800000,
								"subTasks":[
									{"id":"d253db2f-27ec-40ec-9699-722d69b12235","name":"Foul Pipes","startDate":1591002000000,"endDate":1591866000000},
									{"id":"2f9ed722-7ba4-4b79-aece-122d562608e3","name":"Foul Chambers","startDate":1591606800000,"endDate":1592388000000},
									{"id":"9224dfed-faf1-4390-beb3-8c1f4bf10b11","name":"Road Crossing","startDate":1593075600000,"endDate":1593187200000},
									{"id":"7176f48f-f648-407e-b481-40539ef42acd","name":"Connection into Existing Chamber","startDate":1593421200000,"endDate":1593532800000}
								]
							},
							{
								"id":"06d22b37-8198-400a-b8e0-e1e58801902c",
								"name":"Potable Water",
								"startDate":1592211600000,
								"endDate":1593014400000,
								"subTasks":[
									{"id":"2868aed3-bb4a-477c-9641-8178ba33a48c","name":"Install 150mm Water Pipe (416mts)","startDate":1592211600000,"endDate":1592827200000},
									{"id":"bb35ab9f-9079-402e-8f5a-19de8fcaf24f","name":"Valve Chamber","startDate":1592902800000,"endDate":1593014400000}
								]
							},
							{
								"id":"0d04488b-0f21-4a42-bdf4-225d70c0de63",
								"name":"Ducting",
								"startDate":1592470800000,
								"endDate":1593100800000,
								"subTasks":[
									{"id":"e5a25712-8706-429b-8a2e-c4b54f27757a","name":"Trench For Cables","startDate":1592470800000,"endDate":1592582400000},
									{"id":"1eea70b6-ba02-4b97-a84f-7a1f262eb77f","name":"Install Distribution Chamber","startDate":1592816400000,"endDate":1592928000000},
									{"id":"5dc10ae5-7b64-4cfb-b120-2231a851ba29","name":"Trench Reinstatement","startDate":1592989200000,"endDate":1593100800000}
								]
							},
							{
								"id":"a71e792f-6655-4e37-baba-aad4cd19ac8f",
								"name":"Compound Formation",
								"startDate":1593421200000,
								"endDate":1597939200000,
								"subTasks":[
									{"id":"fc69f739-faa1-4cb6-b71d-ddb8a98f7c59","name":"Re Trim & Proof Rolling","startDate":1593421200000,"endDate":1594202400000},
									{"id":"2f7de8e5-ea01-4023-bf16-b41ea1a7f3a0","name":"Welfare areas - Ground Preparation","startDate":1593766800000,"endDate":1594803600000},
									{"id":"18ef7a54-b8c8-4180-984d-0a851a06288e","name":"Bases \/ plinths, foundations & slabs - site wide","startDate":1594371600000,"endDate":1595437200000},
									{"id":"1ac8e8db-c1cb-4177-9879-672b1b329e6f","name":"Trim sub-base and basecourse Car Park & Access Roads","startDate":1595581200000,"endDate":1596729600000},
									{"id":"a17d2251-93f9-4807-852c-fb7a9b38587b","name":"White lining (needs to start work on 8th","startDate":1596790800000,"endDate":1597939200000},
									{"id":"dabd9a41-7003-4ea8-ad6a-1bef79d9cfa3","name":"Basecourse Welfare\/stores\/lighting paving area","startDate":1597050000000,"endDate":1597748400000}
								]
							},
							{
								"id":"6b55409e-f885-43f7-a5a0-54b372d9bffb",
								"name":"Footpaths Finishes",
								"startDate":1593594000000,
								"endDate":1594731600000,
								"subTasks":[
									{"id":"29890ec0-b610-437a-a1e5-d1ad9a4a765e","name":"Footpaths Timber edging (4126mts)","startDate":1593594000000,"endDate":1594659600000},
									{"id":"ae8821f9-f36b-4ae0-95fa-82c6f7e6220b","name":"Geotextile Type 1 (2476 m2)","startDate":1594198800000,"endDate":1594731600000}
								]
							},
							{
								"id":"c26c39d1-fd91-4ffb-8a23-d7c416399a17",
								"name":"Fencing Barriers",
								"startDate":1594803600000,
								"endDate":1598360400000,
								"subTasks":[
									{"id":"bf3e945d-6ec1-417e-a060-6f6edbd3a793","name":"Install fencing to office ramps & office","startDate":1594803600000,"endDate":1595419200000},
									{"id":"92b385dc-68f3-4368-ae53-4f576f9578f9","name":"Install Vehicle Wash areas Smoking shelter, Cycle stand Flag pole & Information board","startDate":1595494800000,"endDate":1596726000000},
									{"id":"40c1bc01-0a84-4bf2-8ad9-b15f238b93d8","name":"Install Vehicle Arm Barriers, Pedestrian Gates & CCTV","startDate":1595581200000,"endDate":1596646800000},
									{"id":"fd7c432f-ddcb-4abd-9d82-a17b78c83061","name":"Lighting","startDate":1596790800000,"endDate":1597240800000},
									{"id":"903bdd21-6140-4a1f-9349-49d184ee1cb5","name":"Fencing (2.4mts) & Gates","startDate":1596790800000,"endDate":1598277600000},
									{"id":"90a2fab2-a855-4d51-9fe6-b43aad8820ea","name":"Top Soil & Seeding","startDate":1597827600000,"endDate":1598360400000}
								]
							},
							{
								"id":"b9433956-a6d2-43f4-9803-37bcec92de04",
								"name":"Not in Programme Yet - Mort\/MAtt",
								"startDate":1598947200000,
								"endDate":1599843600000,
								"subTasks":[
									{"id":"4c9464c6-2733-4ad2-9aad-651570d8a615","name":"Crane Arrives","startDate":1598947200000,"endDate":1598949000000},
									{"id":"6c6f509b-22d7-4b2c-81a3-8c6f2e3d8e38","name":"Lorry_Cabin Arrives","startDate":1598949000000,"endDate":1598952600000},
									{"id":"d3ecc2a0-e457-462f-b8f0-c920b95e9a40","name":"Install Site Cabins_Office_1","startDate":1598950800000,"endDate":1598954400000},
									{"id":"3349c096-2077-42f2-b0c4-483ac821105b","name":"Lorry_Cabin Arrives","startDate":1598952600000,"endDate":1598956200000},
									{"id":"da64158e-a598-4d2e-abdb-08f515ad7f79","name":"Install Site Cabins_Office_2","startDate":1598954400000,"endDate":1598958000000},
									{"id":"9872f62c-2174-40c3-b219-6f4efbb1d8bd","name":"Lorry_Cabin Arrives","startDate":1598956200000,"endDate":1598959800000},
									{"id":"c37ebc50-bc79-4ea4-b8c1-62d4d0be33ad","name":"Install Site Cabins_Office_3","startDate":1598958000000,"endDate":1598961600000},
									{"id":"822b5732-4024-40bf-b49f-1720cedf5742","name":"Lorry_Cabin Arrives","startDate":1598959800000,"endDate":1598963400000},
									{"id":"995dd476-21c2-4eac-9a9b-fa985ee1ca86","name":"Install Site Cabins_Office_4","startDate":1598961600000,"endDate":1598965200000},
									{"id":"139586e7-4adf-4135-80a3-346f66fe59cb","name":"Lorry_Cabin Arrives","startDate":1598967000000,"endDate":1598970600000},
									{"id":"e1511785-e27c-4efd-9888-d82bcc04e7d0","name":"Install Site Cabins_Office_5","startDate":1598968800000,"endDate":1598972400000},
									{"id":"589c7f5a-f814-4777-ab6d-538c4d12c4bb","name":"Lorry_Cabin Arrives","startDate":1598970600000,"endDate":1598974200000},
									{"id":"2f1743b7-77ea-4501-b012-4a9d49045dcd","name":"Install Site Cabins_Office_6","startDate":1598972400000,"endDate":1598976000000},
									{"id":"03e3e8e3-f0cc-4810-bb90-e7446cb7170c","name":"Lorry_Cabin Arrives","startDate":1599035400000,"endDate":1599039000000},
									{"id":"959b9305-c791-43b7-83ee-a8a35e7bf5b1","name":"Install Site Cabins_Office_7","startDate":1599037200000,"endDate":1599040800000},
									{"id":"1b3af2ee-7689-4487-8021-0495663b5580","name":"Lorry_Cabin Arrives","startDate":1599039000000,"endDate":1599042600000},
									{"id":"66cf71ba-35e1-4b73-a257-cf2453beb323","name":"Install Site Cabins_Office_8","startDate":1599040800000,"endDate":1599044400000},
									{"id":"a8ec1c8a-257d-4e39-9130-ac90adf19383","name":"Lorry_Cabin Arrives","startDate":1599042600000,"endDate":1599046200000},
									{"id":"6b074dfe-bb4d-4b9f-a91d-b2779a725d58","name":"Install Site Cabins_Office_9","startDate":1599044400000,"endDate":1599048000000},
									{"id":"0d23a56c-0b48-4fa1-8aa6-53501843e33f","name":"Lorry_Cabin Arrives","startDate":1599046200000,"endDate":1599049800000},
									{"id":"987ebaa6-35d5-4682-aff2-799d77cc0583","name":"Install Site Cabins_Office_10","startDate":1599048000000,"endDate":1599051600000},
									{"id":"e29bef8f-6d71-44e2-8961-0f25c52dcc55","name":"Lorry_Cabin Arrives","startDate":1599053400000,"endDate":1599057000000},
									{"id":"b6cfb8cc-4e1c-46a9-8cfc-31dde3740bc9","name":"Install Site Cabins_Office_11","startDate":1599055200000,"endDate":1599058800000},
									{"id":"c7006ba2-ce04-4067-bffa-4417aeb1a137","name":"Lorry_Cabin Arrives","startDate":1599057000000,"endDate":1599060600000},
									{"id":"d332b7c1-5dd4-4ec9-aba7-ff61a9a09718","name":"Install Site Cabins_Office_12","startDate":1599058800000,"endDate":1599062400000},
									{"id":"d098e0bb-9170-4a8c-b63d-91612f11d3eb","name":"Lorry_Cabin Arrives","startDate":1599121800000,"endDate":1599125400000},
									{"id":"b9bf4ddd-3631-4d47-9453-014914eee82c","name":"Install Site Cabins_Office_13","startDate":1599123600000,"endDate":1599127200000},
									{"id":"074a9fec-bc45-40d6-8db8-e56eb1d1d219","name":"Lorry_Cabin Arrives","startDate":1599125400000,"endDate":1599129000000},
									{"id":"597ca74f-5c2a-4e4a-98bf-8c6e07b0aac2","name":"Install Site Cabins_Office_14","startDate":1599127200000,"endDate":1599130800000},
									{"id":"17c20f20-c6fb-4ad5-a165-4782a726f1c2","name":"Lorry_Cabin Arrives","startDate":1599129000000,"endDate":1599132600000},
									{"id":"e575aa4c-cca8-40a1-87a7-69ba6fc3e7d2","name":"Install Site Cabins_Office_15","startDate":1599130800000,"endDate":1599134400000},
									{"id":"7549bf3f-2d80-4736-b858-858807a17154","name":"Lorry_Cabin Arrives","startDate":1599132600000,"endDate":1599136200000},
									{"id":"0852f6fe-dc43-4148-8864-f0bbdf0f19e0","name":"Install Site Cabins_Office_16","startDate":1599134400000,"endDate":1599138000000},
									{"id":"15d911eb-3923-4faf-a7bb-a6ba236d8f61","name":"Lorry_Cabin Arrives","startDate":1599139800000,"endDate":1599143400000},
									{"id":"57dd2466-1f28-47f9-b656-eff941e51c67","name":"Install Site Cabins_Office_17","startDate":1599141600000,"endDate":1599145200000},
									{"id":"032d465c-cec2-43bb-ac72-83610c261246","name":"Lorry_Cabin Arrives","startDate":1599143400000,"endDate":1599147000000},
									{"id":"08e88e4e-6127-4842-b645-11416ff2a5f3","name":"Install Site Cabins_Office_18","startDate":1599145200000,"endDate":1599148800000},
									{"id":"cb614685-3842-4593-bceb-1dea6a4d04c6","name":"Lorry_Cabin Arrives","startDate":1599208200000,"endDate":1599211800000},
									{"id":"0e9fc4b3-c4c4-4432-8a05-c9938e054695","name":"Install Site Cabins_Office_19","startDate":1599210000000,"endDate":1599213600000},
									{"id":"ea58eb60-2599-469b-b943-030ee5b523e7","name":"Lorry_Cabin Arrives","startDate":1599211800000,"endDate":1599215400000},
									{"id":"3e3659ca-1f93-412d-870e-28692dd9cd22","name":"Install Site Cabins_Office_20","startDate":1599213600000,"endDate":1599217200000},
									{"id":"8ba2fc1d-46e3-4238-b5ef-9928a25cfe14","name":"Lorry_Cabin Arrives","startDate":1599215400000,"endDate":1599219000000},
									{"id":"32336ac7-c857-463f-b9e4-37472016f93a","name":"Install Site Cabins_Office_21","startDate":1599217200000,"endDate":1599220800000},
									{"id":"8e0f3ecb-e617-4289-853c-1235f3cabf44","name":"Lorry_Cabin Arrives","startDate":1599219000000,"endDate":1599222600000},
									{"id":"ae916831-1d8d-4979-9b1b-2a57772b0b16","name":"Install Site Cabins_Office_22","startDate":1599220800000,"endDate":1599224400000},
									{"id":"79cfcf6a-a012-4f4e-a59f-de5881b2a343","name":"Other Installs","startDate":1599469200000,"endDate":1599580800000},
									{"id":"1937aaba-7de5-4856-a1df-7b35c6edf6ea","name":"Cars in Car Park","startDate":1599642000000,"endDate":1599670800000},
									{"id":"9ace695b-0f48-4ff1-894f-a684aef21bf7","name":"Containers & Storge","startDate":1599642000000,"endDate":1599753600000},
									{"id":"7f71fcc0-29cd-42b6-a78e-d7739a392c28","name":"BBV Staff ","startDate":1599728400000,"endDate":1599757200000},
									{"id":"014e8464-c193-430d-b6f7-47a8d7c54d2d","name":"BBV Staff Clash","startDate":1599814800000,"endDate":1599843600000}
								]
							}
						]
					}
				]
			}
		]
	};

	const sequenceId = oldGoldenData._id;
	const stateId = oldGoldenData.frames[0].state;
	const activityId = goldenActivityDetail["_id"];
	const customSequenceId = customGoldenData._id;

	before(function(done) {

		server = app.listen(8080, function () {
			console.log("API test server is listening on port 8080!");
			agent = request.agent(server);
			done();
		});

	});

	after(function(done) {
		server.close(function() {
			console.log("API test server is closed");
			done();
		});
	});

	describe("List all sequences", function() {
		it("should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences?key=${userApiKey}`).expect(200, function(err , res) {
				expect(res.body.length).to.equal(2);
				expect(res.body[0]).to.deep.equal(latestGoldenData);

				return done(err);
			});
		});

		it("from latest revision should succeed [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences?key=${userApiKey}`).expect(200, function(err , res) {

				expect(res.body.length).to.equal(2);
				expect(res.body[0]).to.deep.equal(latestGoldenData);

				return done(err);
			});
		});

		it("from revision should succeed [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/${oldRevision}/sequences?key=${userApiKey}`).expect(200, function(err , res) {

				expect(res.body.length).to.equal(2);
				expect(res.body[0]).to.deep.equal(oldGoldenData);

				return done(err);

			});
		});

		it("from revision should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences?revId=${oldRevision}&key=${userApiKey}`).expect(200, function(err , res) {

				expect(res.body.length).to.equal(2);
				expect(res.body[0]).to.deep.equal(oldGoldenData);

				return done(err);
			});
		});

		it("from federation should succeed [deprecated]", function(done) {
			agent.get(`/${username}/${federation}/revision/master/head/sequences?key=${userApiKey}`).expect(200, function(err , res) {

				expect(res.body.length).to.equal(2);
				expect(res.body[0]).to.deep.equal(latestGoldenData);

				return done(err);
			});
		});

		it("from federation should succeed", function(done) {
			agent.get(`/${username}/${federation}/sequences?key=${userApiKey}`).expect(200, function(err , res) {

				expect(res.body.length).to.equal(2);
				expect(res.body[0]).to.deep.equal(latestGoldenData);

				return done(err);
			});
		});
	});

	describe("Get sequence", function() {
		it("should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
				.expect(200, function(err, res) {
					expect(res.body.name).to.equal(oldGoldenData.name);
					expect(res.body.frames).to.deep.equal(oldGoldenData.frames);

					return done(err);
				});
		});

		it("custom sequence should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${customSequenceId}?key=${userApiKey}`)
				.expect(200, function(err, res) {
					expect(res.body.customSequence).to.equal(true);
					expect(res.body.name).to.equal(customGoldenData.name);
					expect(res.body.frames).to.deep.equal(customGoldenData.frames);

					return done(err);
				});
		});

		it("with invalid ID should fail", function(done) {
			agent.get(`/${username}/${model}/sequences/invalidId?key=${userApiKey}`)
				.expect(404, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);

					return done(err);
				});
		});
	});

	describe("Get sequence state", function() {
		it("should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}/state/${stateId}?key=${userApiKey}`).expect(200, function(err , res) {
				expect(Object.keys(res.body)).to.deep.equal(["transparency", "color"]);

				return done(err);
			});
		});

		it("from latest revision should succeed [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${sequenceId}/state/${stateId}?key=${userApiKey}`).expect(200, function(err , res) {
				expect(Object.keys(res.body)).to.deep.equal(["transparency", "color"]);

				return done(err);
			});
		});

		it("from revision should succeed [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/${oldRevision}/sequences/${sequenceId}/state/${stateId}?key=${userApiKey}`).expect(200, function(err , res) {
				expect(Object.keys(res.body)).to.deep.equal(["transparency", "color"]);

				return done(err);
			});
		});

		it("from revision should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}/state/${stateId}?revId=${oldRevision}&key=${userApiKey}`).expect(200, function(err , res) {
				expect(Object.keys(res.body)).to.deep.equal(["transparency", "color"]);

				return done(err);
			});
		});

		it("from federation should fail [deprecated]", function(done) {
			agent.get(`/${username}/${federation}/revision/master/head/sequences/${sequenceId}/state/${stateId}?key=${userApiKey}`).expect(404, function(err , res) {
				expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);

				return done(err);
			});
		});

		it("from federation should fail", function(done) {
			agent.get(`/${username}/${federation}/sequences/${sequenceId}/state/${stateId}?key=${userApiKey}`).expect(404, function(err , res) {
				expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);

				return done(err);
			});
		});

		it("with invalid state ID should fail [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${sequenceId}/state/invalidId?key=${userApiKey}`).expect(404, function(err , res) {
				expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);

				return done(err);
			});
		});

		it("with invalid state ID should fail", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}/state/invalidId?key=${userApiKey}`).expect(404, function(err , res) {
				expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);

				return done(err);
			});
		});
	});

	/*
	describe("Get sequence activities", function() {
		it("should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}/activities?key=${userApiKey}`).expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenActivity);

				return done(err);
			});
		});

		it("from latest revision should succeed [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${sequenceId}/activities?key=${userApiKey}`).expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenActivity);

				return done(err);
			});
		});

		it("from revision should succeed [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/${oldRevision}/sequences/${sequenceId}/activities?key=${userApiKey}`).expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenActivity);

				return done(err);
			});
		});

		it("from revision should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}/activities?revId=${oldRevision}&key=${userApiKey}`).expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenActivity);

				return done(err);
			});
		});

		it("from federation should fail [deprecated]", function(done) {
			agent.get(`/${username}/${federation}/revision/master/head/sequences/${sequenceId}/activities?key=${userApiKey}`).expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);

				return done(err);
			});
		});

		it("from federation should fail", function(done) {
			agent.get(`/${username}/${federation}/sequences/${sequenceId}/activities?key=${userApiKey}`).expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);

				return done(err);
			});
		});

		it("using invalid sequence ID should fail [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/invalidSequenceId/activities?key=${userApiKey}`).expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);

				return done(err);
			});
		});

		it("using invalid sequence ID should fail", function(done) {
			agent.get(`/${username}/${model}/sequences/invalidSequenceId/activities?key=${userApiKey}`).expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.NO_FILE_FOUND.value);

				return done(err);
			});
		});
	});
	*/

	/*
	describe("Get sequence activity detail", function() {
		it("should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}/activities/${activityId}?key=${userApiKey}`).expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenActivityDetail);

				return done(err);
			});
		});

		it("from latest revision should succeed [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${sequenceId}/activities/${activityId}?key=${userApiKey}`).expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenActivityDetail);

				return done(err);
			});
		});

		it("from revision should succeed [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/${oldRevision}/sequences/${sequenceId}/activities/${activityId}?key=${userApiKey}`).expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenActivityDetail);

				return done(err);
			});
		});

		it("from revision should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}/activities/${activityId}?revId=${oldRevision}&key=${userApiKey}`).expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenActivityDetail);

				return done(err);
			});
		});

		it("from federation should fail [deprecated]", function(done) {
			agent.get(`/${username}/${federation}/revision/master/head/sequences/${sequenceId}/activities/${activityId}?key=${userApiKey}`).expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.ACTIVITY_NOT_FOUND.value);

				return done(err);
			});
		});

		it("from federation should fail", function(done) {
			agent.get(`/${username}/${federation}/sequences/${sequenceId}/activities/${activityId}?key=${userApiKey}`).expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.ACTIVITY_NOT_FOUND.value);

				return done(err);
			});
		});

		it("using invalid sequence ID should succeed [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/invalidSequenceId/activities/${activityId}?key=${userApiKey}`).expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenActivityDetail);
				return done(err);
			});
		});

		it("using invalid sequence ID should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/invalidSequenceId/activities/${activityId}?key=${userApiKey}`).expect(200, function(err, res) {
				expect(res.body).to.deep.equal(goldenActivityDetail);
				return done(err);
			});
		});

		it("using invalid activity ID should fail [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${sequenceId}/activities/invalidActivityId?key=${userApiKey}`).expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.ACTIVITY_NOT_FOUND.value);

				return done(err);
			});
		});

		it("using invalid activity ID should fail", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}/activities/invalidActivityId?key=${userApiKey}`).expect(404, function(err, res) {
				expect(res.body.value).to.equal(responseCodes.ACTIVITY_NOT_FOUND.value);

				return done(err);
			});
		});
	});
	*/

	describe("Update Sequence", function() {
		/*
		it("name with a new string should succeed [deprecated]", function(done) {
			const update = { name: "New name for the sequence"};
			async.series([
				(done) => {
					agent.patch(`/${username}/${model}/revision/master/head/sequences/${sequenceId}?key=${userApiKey}`)
						.send(update)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/revision/${oldRevision}/sequences?key=${userApiKey}`).expect(200, function(err , res) {
						expect(res.body.length).to.equal(1);
						expect(res.body[0]).to.deep.equal({...oldGoldenData, ...update});
						done(err);
					});
				}
			], done);
		});
		*/

		it("name with a new string should succeed", function(done) {
			const update = { name: "New name for the sequence"};
			async.series([
				(done) => {
					agent.patch(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
						.send(update)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/sequences?revId=${oldRevision}&key=${userApiKey}`).expect(200, function(err , res) {
						expect(res.body.length).to.equal(2);
						expect(res.body[0]).to.deep.equal({...oldGoldenData, ...update});
						done(err);
					});
				}
			], done);
		});

		/*
		it("name and frame should only update the name [deprecated]", function(done) {
			const update = { frames: [], name: "another name"};
			async.series([
				(done) => {
					agent.patch(`/${username}/${model}/revision/master/head/sequences/${sequenceId}?key=${userApiKey}`)
						.send(update)
						.expect(200, done);
				},

				(done) => {
					agent.get(`/${username}/${model}/revision/${oldRevision}/sequences?key=${userApiKey}`).expect(200, function(err , res) {
						expect(res.body.length).to.equal(1);
						expect(res.body[0]).to.deep.equal({...oldGoldenData, name: update.name});
						done(err);
					});
				}

			], done);
		});
		*/

		it("name and frame on ready only sequence should fail", function(done) {
			const update = { frames: [], name: "another name"};
			agent.patch(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
				.send(update)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_READ_ONLY.value);
					done(err);
				});
		});

		/*
		it("name and frame on custom sequence should succeed", function(done) {
			const update = { frames: [], name: "another name"};
			async.series([
				(done) => {
					agent.patch(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
						.send(update)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/sequences?revId=${oldRevision}&key=${userApiKey}`).expect(200, function(err , res) {
						expect(res.body.length).to.equal(1);
						expect(res.body[0]).to.deep.equal({...oldGoldenData, name: update.name});
						done(err);
					});
				}

			], done);
		});
		*/

		it("anything but the name on read only sequence should fail [deprecated]", function(done) {
			const update = { frames: []};
			agent.patch(`/${username}/${model}/revision/master/head/sequences/${sequenceId}?key=${userApiKey}`)
				.send(update)
				.expect(400, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_READ_ONLY.value);
					done(err);
				});
		});

		it("anything but the name on read only sequence should fail", function(done) {
			const update = { frames: []};
			agent.patch(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
				.send(update)
				.expect(400, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_READ_ONLY.value);
					done(err);
				});
		});

		it("that does not exist should fail [deprecated]", function(done) {
			const update = { name: "abc"};
			agent.patch(`/${username}/${model}/revision/master/head/sequences/invalidSequence?key=${userApiKey}`)
				.send(update)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("that does not exist should fail", function(done) {
			const update = { name: "abc"};
			agent.patch(`/${username}/${model}/sequences/invalidSequence?key=${userApiKey}`)
				.send(update)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("name as viewer should fail [deprecated]", function(done) {
			const update = { name: "Viewer's attempt"};
			agent.patch(`/${username}/${model}/revision/master/head/sequences/${sequenceId}?key=${viewerApiKey}`)
				.send(update)
				.expect(401, done);
		});

		it("name as viewer should fail", function(done) {
			const update = { name: "Viewer's attempt"};
			agent.patch(`/${username}/${model}/sequences/${sequenceId}?key=${viewerApiKey}`)
				.send(update)
				.expect(401, done);
		});
	});

	const goldenLegendData = {
        "Chairs" : "#ffffaa",
        "Apples" : "#aaaaaa11"
	};

	describe("Getting a legend", function() {
		it("from a sequence that does not exist should fail [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/invalidSequence/legend?key=${userApiKey}`)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("from a sequence that does not exist should fail", function(done) {
			agent.get(`/${username}/${model}/sequences/invalidSequence/legend?key=${userApiKey}`)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("from a sequence that already has a legend should succeed [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${sequenceId}/legend?key=${userApiKey}`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal(goldenLegendData);
					done(err);
				});
		});

		it("from a sequence that already has a legend should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}/legend?key=${userApiKey}`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal(goldenLegendData);
					done(err);
				});
		});

		it("from a sequence that already has a legend as a viewer should succeed [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${sequenceId}/legend?key=${viewerApiKey}`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal(goldenLegendData);
					done(err);
				});
		});

		it("from a sequence that already has a legend as a viewer should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${sequenceId}/legend?key=${viewerApiKey}`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal(goldenLegendData);
					done(err);
				});
		});

		it("from a sequence that does not have a legend should succeed [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal({});
					done(err);
				});
		});

		it("from a sequence that does not have a legend should succeed", function(done) {
			agent.get(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal({});
					done(err);
				});
		});
	});

	describe("Setting a legend as default", function() {
		it("updating the default legend as a viewer should fail", function(done) {
			agent.put(`/${username}/${model}/settings?key=${viewerApiKey}`)
				.send({defaultLegend : sequenceId })
				.expect(401, done);
		});

		it("updating the default legend should succeed", function(done) {
			async.series([
				(done) => {
					agent.put(`/${username}/${model}/settings?key=${userApiKey}`)
						.send({defaultLegend : sequenceId })
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}.json?key=${userApiKey}`)
						.expect(200, (err, res) => {
							expect(res.body.defaultLegend).to.equal(sequenceId);
							done(err);
						});
				}
			], done);
		});

		it("sequences with no legend should get be getting the default legend instead of empty legend [deprecated]", function(done) {
			agent.get(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal(goldenLegendData);
					done(err);
				});
		});

		it("sequences with no legend should get be getting the default legend instead of empty legend", function(done) {
			agent.get(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
				.expect(200, (err, res) => {
					expect(res.body).to.deep.equal(goldenLegendData);
					done(err);
				});
		});
	});


	describe("Updating a legend", function() {
		it("of a valid sequence should succeed [deprecated]", function(done) {
			const newLegend = { a: "#123456", b: "#ffffffaa" };
			async.series([
				(done) => {
					agent.put(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
						.send(newLegend)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
					.expect(200, (err, res) => {
						expect(res.body).to.deep.equal(newLegend);
						done(err);
					});
				}
			], done);

		});

		it("of a valid sequence should succeed", function(done) {
			const newLegend = { a: "#123456", b: "#ffffffaa" };
			async.series([
				(done) => {
					agent.put(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
						.send(newLegend)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
					.expect(200, (err, res) => {
						expect(res.body).to.deep.equal(newLegend);
						done(err);
					});
				}
			], done);

		});

		it("of an invalid sequence should fail [deprecated]", function(done) {
			const newLegend = { a: "#123456", b: "#ffffffaa" };
			agent.put(`/${username}/${model}/revision/master/head/sequences/invalidSequenceID/legend?key=${userApiKey}`)
				.send(newLegend)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("of an invalid sequence should fail", function(done) {
			const newLegend = { a: "#123456", b: "#ffffffaa" };
			agent.put(`/${username}/${model}/sequences/invalidSequenceID/legend?key=${userApiKey}`)
				.send(newLegend)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("with the wrong data type should fail [deprecated]", function(done) {
			const newLegend = { a: "#123456", b: false };
			agent.put(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
				.send(newLegend)
				.expect(400, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with the wrong data type should fail", function(done) {
			const newLegend = { a: "#123456", b: false };
			agent.put(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
				.send(newLegend)
				.expect(400, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with the string that isn't in hex colour format should fail [deprecated]", function(done) {
			const newLegend = { a: "#123456", b: "hello" };
			agent.put(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
				.send(newLegend)
				.expect(400, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("with the string that isn't in hex colour format should fail", function(done) {
			const newLegend = { a: "#123456", b: "hello" };
			agent.put(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
				.send(newLegend)
				.expect(400, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					done(err);
				});
		});

		it("as a viewer should fail [deprecated]", function(done) {
			const newLegend = { a: "#123456" };
			agent.put(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${viewerApiKey}`)
				.send(newLegend)
				.expect(401, done);
		});

		it("as a viewer should fail", function(done) {
			const newLegend = { a: "#123456" };
			agent.put(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${viewerApiKey}`)
				.send(newLegend)
				.expect(401, done);
		});
	});

	describe("Deleting a legend", function() {
		it("as a viewer should fail [deprecated]", function(done) {
			agent.delete(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${viewerApiKey}`)
				.expect(401, done);
		});

		it("as a viewer should fail", function(done) {
			agent.delete(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${viewerApiKey}`)
				.expect(401, done);
		});

		it("of an invalid sequence ID should fail [deprecated]", function(done) {
			agent.delete(`/${username}/${model}/revision/master/head/sequences/aaa/legend?key=${userApiKey}`)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("of an invalid sequence ID should fail", function(done) {
			agent.delete(`/${username}/${model}/sequences/aaa/legend?key=${userApiKey}`)
				.expect(404, (err, res) => {
					expect(res.body.value).to.equal(responseCodes.SEQUENCE_NOT_FOUND.value);
					done(err);
				});
		});

		it("should succeed [deprecated]", function(done) {
			async.series([
				(done) => {
					agent.delete(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/revision/master/head/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
					.expect(200, (err, res) => {
						expect(res.body).to.deep.equal(goldenLegendData);
						done(err);
					});
				}
			], done);
		});

		it("should succeed", function(done) {
			async.series([
				(done) => {
					agent.delete(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
						.expect(200, done);
				},
				(done) => {
					agent.get(`/${username}/${model}/sequences/${latestGoldenData._id}/legend?key=${userApiKey}`)
					.expect(200, (err, res) => {
						expect(res.body).to.deep.equal(goldenLegendData);
						done(err);
					});
				}
			], done);
		});
	});

	describe("Creating a custom sequence", function() {
		const baseCustomSequence = {
			frames: [
				{
					"dateTime":1446624000000,
					"viewpoint": {
						"up":[0,1,0],
						"position":[38,38 ,125.08011914810137],
						"look_at":[0,0,-163.08011914810137],
						"view_dir":[0,0,-1],
						"right":[1,0,0],
						"fov":2.1124830653010416,
						"aspect_ratio":0.8750189337327384,
						"far":276.75612077194506 ,
						"near":76.42411012233212
					}
				},
				{
					"dateTime":1446710400000,
					"viewpoint": {
						"up":[0,1,0],
						"position":[30,35 ,100],
						"look_at":[0,0,-150],
						"view_dir":[0,0,-1],
						"right":[1,0,0],
						"fov":2.1124830653010416,
						"aspect_ratio":0.8750189337327384,
						"far":276.75612077194506 ,
						"near":76.42411012233212
					}
				}
			]
		};

		it("should succeed", function(done) {
			const sequence = Object.assign({"name":"Sequence test"}, baseCustomSequence);
			let sequenceId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/sequences?key=${userApiKey}`)
						.send(sequence)
						.expect(200, function(err, res) {
							sequenceId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.customSequence).to.equal(true);
							expect(res.body.name).to.equal(sequence.name);
							expect(res.body.frames).to.deep.equal(sequence.frames);

							return done(err);
						});
				}
			], done);
		});

		it("with highlighted objects should succeed", function(done) {
			const highlighted_group = {
				objects: [{
					"account": username,
					model,
					"shared_ids":["8b9259d2-316d-4295-9591-ae020bfcce48"]
				}],
				color: [2555, 255, 0]
			};

			const hidden_group = {
				objects: [{
					"account": username,
					model,
					"shared_ids":["69b60e77-e049-492f-b8a3-5f5b2730129c"]
				}]
			};

			const override_groups = [
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}],
					color: [1, 2, 3],
					totalSavedMeshes: 1
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					color: [4, 5, 6],
					totalSavedMeshes: 1
				},
			];

			const sequence = Object.assign({"name":"Sequence test"}, baseCustomSequence);
			sequence.frames = [
				Object.assign({}, baseCustomSequence.frames[0]),
				baseCustomSequence.frames[1]
			];
			sequence.frames[0].viewpoint = Object.assign(
				{highlighted_group, hidden_group, override_groups},
				baseCustomSequence.frames[0].viewpoint
			);
			let sequenceId;
			let highlightedGroupId;
			let hiddenGroupId;
			let overrideGroupIds;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/sequences?key=${userApiKey}`)
						.send(sequence)
						.expect(200, function(err, res) {
							sequenceId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.customSequence).to.equal(true);
							expect(res.body.name).to.equal(sequence.name);

							highlightedGroupId = res.body.frames[0].viewpoint.highlighted_group_id;
							delete res.body.frames[0].viewpoint.highlighted_group_id;
							delete sequence.frames[0].viewpoint.highlighted_group;

							hiddenGroupId = res.body.frames[0].viewpoint.hidden_group_id;
							delete res.body.frames[0].viewpoint.hidden_group_id;
							delete sequence.frames[0].viewpoint.hidden_group;

							overrideGroupIds = res.body.frames[0].viewpoint.override_group_ids;
							delete res.body.frames[0].viewpoint.override_group_ids;
							delete sequence.frames[0].viewpoint.override_groups;

							expect(res.body.frames).to.deep.equal(sequence.frames);

							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${highlightedGroupId}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.objects).to.deep.equal(highlighted_group.objects);
							expect(res.body.color).to.deep.equal(highlighted_group.color);
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${hiddenGroupId}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.objects).to.deep.equal(hidden_group.objects);
							expect(res.body.color).to.deep.equal(hidden_group.color);
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${overrideGroupIds[0]}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.objects).to.deep.equal(override_groups[0].objects);
							expect(res.body.color).to.deep.equal(override_groups[0].color);
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/revision/master/head/groups/${overrideGroupIds[1]}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.objects).to.deep.equal(override_groups[1].objects);
							expect(res.body.color).to.deep.equal(override_groups[1].color);
							return done(err);
						});
				}
			], done);
		});

		it("with viewId should succeed", function(done) {
			const view = {
				"name":"View test",
				"viewpoint": baseCustomSequence.frames[0].viewpoint
			};
			const sequence = Object.assign({"name":"Sequence test"}, baseCustomSequence);
			let sequenceId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/viewpoints?key=${userApiKey}`)
						.send(view)
						.expect(200, function(err, res) {
							sequence.frames = [
								Object.assign({viewId: res.body._id}, baseCustomSequence.frames[0]),
								baseCustomSequence.frames[1]
							];
							delete sequence.frames[0].viewpoint;
							return done(err);
						});
				},
				function(done) {
					agent.post(`/${username}/${model}/sequences?key=${userApiKey}`)
						.send(sequence)
						.expect(200, function(err, res) {
							sequenceId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							delete res.body.frames[0].viewpoint.screenshot_ref;
							expect(res.body.customSequence).to.equal(true);
							expect(res.body.name).to.equal(sequence.name);
							expect(res.body.frames).to.deep.equal(baseCustomSequence.frames);

							return done(err);
						});
				}
			], done);
		});

		it("with transformation in viewpoint should fail", function(done) {
			const transformation_groups = [
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["8b9259d2-316d-4295-9591-ae020bfcce48"]
					}],
					transformation: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
				},
				{
					objects: [{
						"account": username,
						model,
						"shared_ids": ["69b60e77-e049-492f-b8a3-5f5b2730129c"]
					}],
					transformation: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
				},
			];

			const sequence = Object.assign({"name":"Sequence test"}, baseCustomSequence);
			sequence.frames = [
				Object.assign({}, baseCustomSequence.frames[0]),
				baseCustomSequence.frames[1]
			];
			sequence.frames[0].viewpoint = Object.assign({transformation_groups}, baseCustomSequence.frames[0].viewpoint);
			let sequenceId;

			agent.post(`/${username}/${model}/sequences?key=${userApiKey}`)
				.send(sequence)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
					return done(err);
				});
		});

		it("with revision should succeed", function(done) {
			const sequence = Object.assign({"name":"Sequence test", "revId": oldRevision}, baseCustomSequence);
			let sequenceId;

			async.series([
				function(done) {
					agent.post(`/${username}/${model}/sequences?key=${userApiKey}`)
						.send(sequence)
						.expect(200, function(err, res) {
							sequenceId = res.body._id;
							return done(err);
						});
				},
				function(done) {
					agent.get(`/${username}/${model}/sequences/${sequenceId}?key=${userApiKey}`)
						.expect(200, function(err, res) {
							expect(res.body.customSequence).to.equal(true);
							expect(res.body.name).to.equal(sequence.name);
							expect(res.body.frames).to.deep.equal(sequence.frames);

							return done(err);
						});
				}
			], done);
		});

		it("with invalid revision should fail", function(done) {
			const sequence = Object.assign({"name":"Sequence test", "revId": "badRevision"}, baseCustomSequence);

			agent.post(`/${username}/${model}/sequences?key=${userApiKey}`)
				.send(sequence)
				.expect(400, function(err, res) {
					expect(res.body.value).to.equal(responseCodes.INVALID_TAG_NAME.value);
					return done(err);
				});
		});
	});
});
