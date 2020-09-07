/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { put, select, take, takeLatest } from 'redux-saga/effects';

import { selectSelectedSequenceId, selectSelectedStateId, selectStateDefinitions,
	SequencesActions, SequencesTypes } from '.';
import * as API from '../../services/api';
import { DialogActions } from '../dialog';
import { selectCurrentModel, selectCurrentModelTeamspace,
	selectCurrentRevisionId, selectSettings } from '../model/model.selectors';
import { dispatch } from '../store';
import { selectIfcSpacesHidden, TreeActions } from '../tree';
import { getSelectedFrame, selectFrames, selectIfcSpacesHiddenSaved,
	selectSelectedDate, selectSequences, selectSequenceModel, selectTasksDefinitions } from './sequences.selectors';

const tasks = { "tasks":
[
	{
		"id": "b7b025f2-9e0d-4677-920a-342ca363e587",
		"name": "CONSTRUCTION",
		"startDate": 1586941200000,
		"endDate": 1599843600000,
		"subTasks": [
			{
				"id": "82bbf422-9f35-4a79-b409-5f06b2964702",
				"name": "Temporary Office & Compound",
				"startDate": 1586941200000,
				"endDate": 1597766400000,
				"subTasks": [
					{
						"id": "23ad00c0-0de1-4a6c-97a1-ca33b020d85d",
						"name": "Strip Top Soil in Area for Site Set Up",
						"startDate": 1586941200000,
						"endDate": 1587052800000
					},
					{
						"id": "b2926ae0-e931-4e00-a600-7a909c52d3e2",
						"name": "Set Up Heras Fencing for Site Compound",
						"startDate": 1586941200000,
						"endDate": 1587135600000
					},
					{
						"id": "81f018d0-5df3-4ece-8fd5-e3439eab7ee1",
						"name": "AQV Compound Duration",
						"startDate": 1586941200000,
						"endDate": 1597766400000
					},
					{
						"id": "9f931227-1d89-462f-bf57-0a1793a30115",
						"name": "Excavate Out to Widen Access Road",
						"startDate": 1587373200000,
						"endDate": 1587484800000
					},
					{
						"id": "a680c355-2849-4614-bfe2-5fd90549dee8",
						"name": "Stone Up Site Compund & Access Road",
						"startDate": 1587459600000,
						"endDate": 1587654000000
					},
					{
						"id": "333b5f23-a264-4aaa-a8d6-80fa4ff107f8",
						"name": "Set Up gate Security Cabin",
						"startDate": 1587718800000,
						"endDate": 1587747600000
					},
					{
						"id": "8cf65556-8730-4050-a73c-c2d500abf7cf",
						"name": "Offload Site Cabins",
						"startDate": 1587718800000,
						"endDate": 1588003200000
					},
					{
						"id": "9440fd9c-a511-44bb-ad77-4ca542b2125a",
						"name": "Demob",
						"startDate": 1587718800000,
						"endDate": 1597312860000
					},
					{
						"id": "4d14fb4e-9412-44b6-8d22-d633399631db",
						"name": "Offload Generator, Diesel Tank & Water Boweser",
						"startDate": 1588064400000,
						"endDate": 1588093200000
					},
					{
						"id": "dfd35aa6-4b29-4777-be12-518611be8048",
						"name": "Wire Up Site Cabins",
						"startDate": 1588064400000,
						"endDate": 1588176000000
					}
				]
			},
			{
				"id": "abdd5f6f-77d1-4310-8a5c-7a81cf9de045",
				"name": "Main Site Compound",
				"startDate": 1588237200000,
				"endDate": 1599843600000,
				"subTasks": [
					{
						"id": "21448904-561d-4336-9d9e-2a14c9899bae",
						"name": "Initial Compound Set Up",
						"startDate": 1588237200000,
						"endDate": 1591117200000,
						"subTasks": [
							{
								"id": "1ae68da1-46b3-41f8-b3b8-8e67df000b30",
								"name": "Strip and Load Topsoil Type 4 to South Stockpile Area (1000m2)",
								"startDate": 1588237200000,
								"endDate": 1588604400000
							},
							{
								"id": "07faff92-e6fa-4419-a550-d8ac78487fc5",
								"name": "Strip and Load Topsoil Type 5 to East Stockpile Area (16000m2)",
								"startDate": 1588669200000,
								"endDate": 1589367600000
							},
							{
								"id": "3d8f30ae-6af8-4c19-8e91-c642f48b4260",
								"name": "Localised Cut / Fill Level & Compact Formation (Possible 1260m3 Short Fall)",
								"startDate": 1589274000000,
								"endDate": 1589385600000
							},
							{
								"id": "a78f7363-0e58-4b5c-b5b8-808e709a5cf6",
								"name": "Import & Lay Type 1",
								"startDate": 1589360400000,
								"endDate": 1590674400000
							},
							{
								"id": "53e06b6d-2907-4a24-b68b-1b47e672f0f1",
								"name": "Set Out Different Construction Areas (Access Road) & Trim Access Roads",
								"startDate": 1590483600000,
								"endDate": 1590678000000
							},
							{
								"id": "bae11d41-5069-4376-9249-e291fbed18df",
								"name": "Testing",
								"startDate": 1590742800000,
								"endDate": 1591027200000
							},
							{
								"id": "cef7a454-ac14-4418-b971-3692c361a725",
								"name": "Survey of Finished Levels & Area Handover",
								"startDate": 1591088400000,
								"endDate": 1591117200000
							}
						]
					},
					{
						"id": "01535428-c2e4-42a1-a7c6-616812ee1c0b",
						"name": "Surface Water Drainage",
						"startDate": 1591002000000,
						"endDate": 1593522000000,
						"subTasks": [
							{
								"id": "4e397373-382c-45dd-b85a-f353816ae13c",
								"name": "Carrier Pipes - 291mts",
								"startDate": 1591002000000,
								"endDate": 1591783200000
							},
							{
								"id": "3fb09817-8569-4fac-819c-58febed73366",
								"name": "Filter Carrier Pipe - 381mts",
								"startDate": 1591002000000,
								"endDate": 1591894800000
							},
							{
								"id": "c85a4867-c513-4ef7-aa10-8f418cf7d321",
								"name": "Chambers - 6 No.",
								"startDate": 1591866000000,
								"endDate": 1592902800000
							},
							{
								"id": "2bff2231-6151-40eb-971e-a6c7b5e4982a",
								"name": "Rodding Eye - 5 No.",
								"startDate": 1592989200000,
								"endDate": 1593018000000
							},
							{
								"id": "ed77c123-daba-41fc-a273-55e47a90c37e",
								"name": "V-Ditch",
								"startDate": 1592989200000,
								"endDate": 1593183600000
							},
							{
								"id": "ee8a181d-ce17-4a40-a068-60e095d6a210",
								"name": "Oil Interceptor 7m * 2m * 1.5m Capture 30,000 m2",
								"startDate": 1592989200000,
								"endDate": 1593522000000
							},
							{
								"id": "43eadab7-7c4d-4da8-8c95-937d4ba3d112",
								"name": "Head Wall",
								"startDate": 1593421200000,
								"endDate": 1593450000000
							}
						]
					},
					{
						"id": "595ecc5c-31c3-4c55-a883-f1a961538ce5",
						"name": "Foul Water Drainage",
						"startDate": 1591002000000,
						"endDate": 1593532800000,
						"subTasks": [
							{
								"id": "88447088-67ae-40a0-b904-357f7d04f69f",
								"name": "Foul Pipes",
								"startDate": 1591002000000,
								"endDate": 1591866000000
							},
							{
								"id": "276c63d8-c9b8-4fe7-b87f-df5ca54734fc",
								"name": "Foul Chambers",
								"startDate": 1591606800000,
								"endDate": 1592388000000
							},
							{
								"id": "7afa019d-47e8-49c1-8372-f732b533c417",
								"name": "Road Crossing",
								"startDate": 1593075600000,
								"endDate": 1593187200000
							},
							{
								"id": "3a4ab85f-355a-49f4-a6c0-7f17a1df8c25",
								"name": "Connection into Existing Chamber",
								"startDate": 1593421200000,
								"endDate": 1593532800000
							}
						]
					},
					{
						"id": "f26d3bcc-3cf2-423d-857f-acfb003af94e",
						"name": "Potable Water",
						"startDate": 1592211600000,
						"endDate": 1593014400000,
						"subTasks": [
							{
								"id": "c96b1fad-818f-4244-817f-1677416a73de",
								"name": "Install 150mm Water Pipe (416mts)",
								"startDate": 1592211600000,
								"endDate": 1592827200000
							},
							{
								"id": "ab69d098-0a5c-402c-b5cd-7432f7c99259",
								"name": "Valve Chamber",
								"startDate": 1592902800000,
								"endDate": 1593014400000
							}
						]
					},
					{
						"id": "a4aa8d5f-4734-4c68-9b86-075edaa399ed",
						"name": "Ducting",
						"startDate": 1592470800000,
						"endDate": 1593100800000,
						"subTasks": [
							{
								"id": "cb6611ec-58f6-427a-9dcd-56adf6533737",
								"name": "Trench For Cables",
								"startDate": 1592470800000,
								"endDate": 1592582400000
							},
							{
								"id": "aa31c308-ee42-4ed2-b37f-fbfb4a934c10",
								"name": "Install Distribution Chamber",
								"startDate": 1592816400000,
								"endDate": 1592928000000
							},
							{
								"id": "8c31577f-3cff-439c-bd1a-5b9080ded19d",
								"name": "Trench Reinstatement",
								"startDate": 1592989200000,
								"endDate": 1593100800000
							}
						]
					},
					{
						"id": "0ac31871-bf5f-4a59-bc1e-0e5455a4d698",
						"name": "Compound Formation",
						"startDate": 1593421200000,
						"endDate": 1597939200000,
						"subTasks": [
							{
								"id": "974d25d8-ba12-42e9-b176-9bf9d9a1ab3f",
								"name": "Re Trim & Proof Rolling",
								"startDate": 1593421200000,
								"endDate": 1594202400000
							},
							{
								"id": "e076a2d3-e996-4e87-91fc-1fd6f2fd826c",
								"name": "Welfare areas - Ground Preparation",
								"startDate": 1593766800000,
								"endDate": 1594803600000
							},
							{
								"id": "8370cdba-d679-4ffd-a2d0-c49c2031d6ff",
								"name": "Bases / plinths, foundations & slabs - site wide",
								"startDate": 1594371600000,
								"endDate": 1595437200000
							},
							{
								"id": "873b7834-43ca-4654-b50e-0f3b585c5b95",
								"name": "Trim sub-base and basecourse Car Park & Access Roads",
								"startDate": 1595581200000,
								"endDate": 1596729600000
							},
							{
								"id": "3a9b887d-41c0-4f02-926e-0171e1434784",
								"name": "White lining (needs to start work on 8th",
								"startDate": 1596790800000,
								"endDate": 1597939200000
							},
							{
								"id": "6d85ff3a-073f-4605-b2b9-6a4f1ba558e2",
								"name": "Basecourse Welfare/stores/lighting paving area",
								"startDate": 1597050000000,
								"endDate": 1597748400000
							}
						]
					},
					{
						"id": "de6c9107-aa33-4827-af8a-6bf422a7ce12",
						"name": "Footpaths Finishes",
						"startDate": 1593594000000,
						"endDate": 1594731600000,
						"subTasks": [
							{
								"id": "ffed7fc1-0028-49a1-af47-34ba6fddc379",
								"name": "Footpaths Timber edging (4126mts)",
								"startDate": 1593594000000,
								"endDate": 1594659600000
							},
							{
								"id": "205994ce-f22c-4660-a2e4-2123bb43c052",
								"name": "Geotextile Type 1 (2476 m2)",
								"startDate": 1594198800000,
								"endDate": 1594731600000
							}
						]
					},
					{
						"id": "37eab8de-3ecb-4a33-bfb2-e3df9b8dd1fe",
						"name": "Fencing Barriers",
						"startDate": 1594803600000,
						"endDate": 1598360400000,
						"subTasks": [
							{
								"id": "716dbdc9-f1cb-4959-9cb4-dc5edd49e614",
								"name": "Install fencing to office ramps & office",
								"startDate": 1594803600000,
								"endDate": 1595419200000
							},
							{
								"id": "208e81d6-a4db-4f22-a967-5a280eda2230",
								"name": "Install Vehicle Wash areas Smoking shelter, Cycle stand Flag pole & Information board",
								"startDate": 1595494800000,
								"endDate": 1596726000000
							},
							{
								"id": "07f398a5-1ded-4057-a061-8ffac3d8239d",
								"name": "Install Vehicle Arm Barriers, Pedestrian Gates & CCTV",
								"startDate": 1595581200000,
								"endDate": 1596646800000
							},
							{
								"id": "1d3d7580-4f90-4b9d-92ed-090e773ceab5",
								"name": "Lighting",
								"startDate": 1596790800000,
								"endDate": 1597240800000
							},
							{
								"id": "93e6a958-4282-41c0-96bc-3b50b5fa3852",
								"name": "Fencing (2.4mts) & Gates",
								"startDate": 1596790800000,
								"endDate": 1598277600000
							},
							{
								"id": "2a1fc81d-829f-4050-aa48-5ce16097d582",
								"name": "Top Soil & Seeding",
								"startDate": 1597827600000,
								"endDate": 1598360400000
							}
						]
					},
					{
						"id": "f0033305-90f1-4e97-953e-0ca9a3b3cb62",
						"name": "Not in Programme Yet - Mort/MAtt",
						"startDate": 1598947200000,
						"endDate": 1599843600000,
						"subTasks": [
							{
								"id": "fa8d8347-3f3b-4749-9f2e-53c687f636b4",
								"name": "Crane Arrives",
								"startDate": 1598947200000,
								"endDate": 1598949000000
							},
							{
								"id": "1663453b-9040-4426-8140-5e9859240302",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1598949000000,
								"endDate": 1598952600000
							},
							{
								"id": "10e6c077-05f4-4fc6-b4d0-b0303a7ead0c",
								"name": "Install Site Cabins_Office_1",
								"startDate": 1598950800000,
								"endDate": 1598954400000
							},
							{
								"id": "90210878-edef-4494-8a8c-38d1e61327a6",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1598952600000,
								"endDate": 1598956200000
							},
							{
								"id": "1e8ac313-70e6-4faa-9f58-f8c67f71e2e9",
								"name": "Install Site Cabins_Office_2",
								"startDate": 1598954400000,
								"endDate": 1598958000000
							},
							{
								"id": "7870f9fd-425b-4111-83a4-9f36bca92399",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1598956200000,
								"endDate": 1598959800000
							},
							{
								"id": "1ed04621-9675-4f11-8a91-61f682e3948e",
								"name": "Install Site Cabins_Office_3",
								"startDate": 1598958000000,
								"endDate": 1598961600000
							},
							{
								"id": "75c074d8-ccd6-4d47-9711-6e79223d2cbe",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1598959800000,
								"endDate": 1598963400000
							},
							{
								"id": "f15f0bc8-17e6-4fbd-ba0c-b9ef96dfe8bd",
								"name": "Install Site Cabins_Office_4",
								"startDate": 1598961600000,
								"endDate": 1598965200000
							},
							{
								"id": "ecdfad94-23a8-4665-be6d-59a1fc3b10fa",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1598967000000,
								"endDate": 1598970600000
							},
							{
								"id": "09226526-6b96-4cbc-a9f5-ab0a8c9c4447",
								"name": "Install Site Cabins_Office_5",
								"startDate": 1598968800000,
								"endDate": 1598972400000
							},
							{
								"id": "5bb06a4e-2243-487d-822b-89eec4b1b597",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1598970600000,
								"endDate": 1598974200000
							},
							{
								"id": "9a72cfbf-5b7b-44cd-a0e9-42a4db3a0b44",
								"name": "Install Site Cabins_Office_6",
								"startDate": 1598972400000,
								"endDate": 1598976000000
							},
							{
								"id": "c7d3d91c-9d67-4c43-a55f-a26cd54cb262",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599035400000,
								"endDate": 1599039000000
							},
							{
								"id": "b3c9ff67-f251-4280-8d3b-58e45573d997",
								"name": "Install Site Cabins_Office_7",
								"startDate": 1599037200000,
								"endDate": 1599040800000
							},
							{
								"id": "9d67f208-851b-4005-b923-93a36576bf15",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599039000000,
								"endDate": 1599042600000
							},
							{
								"id": "262dfe8e-b814-4c29-bbb3-294131976512",
								"name": "Install Site Cabins_Office_8",
								"startDate": 1599040800000,
								"endDate": 1599044400000
							},
							{
								"id": "02c95262-324d-4715-9dc0-9516da796695",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599042600000,
								"endDate": 1599046200000
							},
							{
								"id": "bb7b8e94-979f-45b9-8608-a49f7c66c8c2",
								"name": "Install Site Cabins_Office_9",
								"startDate": 1599044400000,
								"endDate": 1599048000000
							},
							{
								"id": "5449c6a6-afb0-496c-86cc-6a2fb171888b",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599046200000,
								"endDate": 1599049800000
							},
							{
								"id": "e6aad697-96ea-47cb-8205-ebbc49c38357",
								"name": "Install Site Cabins_Office_10",
								"startDate": 1599048000000,
								"endDate": 1599051600000
							},
							{
								"id": "372a5851-2fda-4b50-8cb9-722e52552d52",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599053400000,
								"endDate": 1599057000000
							},
							{
								"id": "8691b766-4d8a-496c-a58b-36e2734e7ae9",
								"name": "Install Site Cabins_Office_11",
								"startDate": 1599055200000,
								"endDate": 1599058800000
							},
							{
								"id": "2bd9412d-a1d0-4903-9b6b-8f0525ce15f8",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599057000000,
								"endDate": 1599060600000
							},
							{
								"id": "7db56a53-b862-41af-a16d-b5453c911e4c",
								"name": "Install Site Cabins_Office_12",
								"startDate": 1599058800000,
								"endDate": 1599062400000
							},
							{
								"id": "9c2f31cf-844a-4ee4-9cf2-dadbba5fa8ab",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599121800000,
								"endDate": 1599125400000
							},
							{
								"id": "10724b79-e068-4e55-a820-6ca7182e859e",
								"name": "Install Site Cabins_Office_13",
								"startDate": 1599123600000,
								"endDate": 1599127200000
							},
							{
								"id": "8ecb6d8d-240c-45d4-9714-2d82bb79f6a1",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599125400000,
								"endDate": 1599129000000
							},
							{
								"id": "4fc3cbbd-7b7e-4ccd-9cee-f0d59c808e21",
								"name": "Install Site Cabins_Office_14",
								"startDate": 1599127200000,
								"endDate": 1599130800000
							},
							{
								"id": "12b65c39-15a8-43b9-a404-e04faf2c9822",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599129000000,
								"endDate": 1599132600000
							},
							{
								"id": "3e0e80f6-6b09-4b91-8155-062a6e262a9b",
								"name": "Install Site Cabins_Office_15",
								"startDate": 1599130800000,
								"endDate": 1599134400000
							},
							{
								"id": "315f94b9-a0ed-430b-937b-ffb558070a48",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599132600000,
								"endDate": 1599136200000
							},
							{
								"id": "37b024b2-d700-4f1a-8a0b-446f34f596fc",
								"name": "Install Site Cabins_Office_16",
								"startDate": 1599134400000,
								"endDate": 1599138000000
							},
							{
								"id": "dfa7e5b5-55ab-4729-b0ad-2c4b1b13b931",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599139800000,
								"endDate": 1599143400000
							},
							{
								"id": "04c428c3-233b-4542-a229-094616d02c92",
								"name": "Install Site Cabins_Office_17",
								"startDate": 1599141600000,
								"endDate": 1599145200000
							},
							{
								"id": "8dc42d8f-673c-486f-bbb1-97def8c94535",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599143400000,
								"endDate": 1599147000000
							},
							{
								"id": "7bceda0f-99f9-40ea-aa07-26df6a417d52",
								"name": "Install Site Cabins_Office_18",
								"startDate": 1599145200000,
								"endDate": 1599148800000
							},
							{
								"id": "396faf09-5b70-47d9-b8b1-d28eb29be5dd",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599208200000,
								"endDate": 1599211800000
							},
							{
								"id": "a0ebad0b-0dfe-438f-93bc-f896052b03bb",
								"name": "Install Site Cabins_Office_19",
								"startDate": 1599210000000,
								"endDate": 1599213600000
							},
							{
								"id": "08cbf01e-9bcc-4ae9-b0eb-e909acaa3da8",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599211800000,
								"endDate": 1599215400000
							},
							{
								"id": "69eede3b-be25-42da-9b34-6f7a79a0d146",
								"name": "Install Site Cabins_Office_20",
								"startDate": 1599213600000,
								"endDate": 1599217200000
							},
							{
								"id": "07877591-51cf-4543-bf42-1996ecfca706",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599215400000,
								"endDate": 1599219000000
							},
							{
								"id": "75b3eb92-078b-461c-a206-afaf37cc106e",
								"name": "Install Site Cabins_Office_21",
								"startDate": 1599217200000,
								"endDate": 1599220800000
							},
							{
								"id": "24352b6d-371e-4c55-bdb1-7f29180c7804",
								"name": "Lorry_Cabin Arrives",
								"startDate": 1599219000000,
								"endDate": 1599222600000
							},
							{
								"id": "9d1e5faa-fc68-4b92-89a2-d59a6ebca657",
								"name": "Install Site Cabins_Office_22",
								"startDate": 1599220800000,
								"endDate": 1599224400000
							},
							{
								"id": "bded78c4-e066-402a-8b3a-b8d6dce6a63e",
								"name": "Other Installs",
								"startDate": 1599469200000,
								"endDate": 1599580800000
							},
							{
								"id": "ba0d5b35-1f2d-44b4-ba4f-97dfd85be82e",
								"name": "Cars in Car Park",
								"startDate": 1599642000000,
								"endDate": 1599670800000
							},
							{
								"id": "88fe75c6-31d4-422a-ae62-310f485b473b",
								"name": "Containers & Storge",
								"startDate": 1599642000000,
								"endDate": 1599753600000
							},
							{
								"id": "1c6d82af-0bfe-469f-b758-002459f92f34",
								"name": "BBV Staff ",
								"startDate": 1599728400000,
								"endDate": 1599757200000
							},
							{
								"id": "3ddde561-1d9a-4e18-9429-9d2f4f631bf0",
								"name": "BBV Staff Clash",
								"startDate": 1599814800000,
								"endDate": 1599843600000
							}
						]
					}
				]
			}
		]
	}
]
}

const delay = async (time) => {
	return new Promise( (resolve, reject) => {
		setTimeout(() => {
			resolve(true);
		}, time);
	});
};

export function* fetchSequences() {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const revision = yield select(selectCurrentRevisionId);
		const model = yield select(selectCurrentModel);

		const response = yield API.getSequences(teamspace, model, revision);
		yield put(SequencesActions.fetchSequencesSuccess(response.data));

	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'sequences', error));
	}
}

export function* fetchTasksDefinitions({sequenceId}) {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const revision = yield select(selectCurrentRevisionId);
		const model = yield select(selectCurrentModel);
		const tasksDefinitions = yield select(selectTasksDefinitions);

		if (!tasksDefinitions) {
			// API CALL TO GET TASKS
			// const response = yield API.getSequences(teamspace, model, revision);
			yield put(SequencesActions.fetchTasksDefinitionsSuccess(sequenceId, tasks.tasks));
		}

		yield put(SequencesActions.fetchSequencesSuccess());

	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('get', 'sequences', error));
	}
}

export function* fetchFrame({date}) {
	try {
		const teamspace = yield select(selectCurrentModelTeamspace);
		const revision = yield select(selectCurrentRevisionId);
		const model = yield select(selectSequenceModel);
		const sequenceId =  yield select(selectSelectedSequenceId);

		const loadedStates = yield select(selectStateDefinitions);
		const frames = yield select(selectFrames);
		const frame = getSelectedFrame(frames, date);

		const stateId = frame.state;

		if (!loadedStates[stateId]) {
			// Using directly the promise and 'then' to dispatch the rest of the actions
			// because with yield it would sometimes stop there forever even though the promise resolved
			API.getSequenceState(teamspace, model, revision, sequenceId, stateId).then((response) => {
				dispatch(SequencesActions.setStateDefinition(stateId, response.data));
				dispatch(SequencesActions.setLastLoadedSuccesfullState(stateId));
			}).catch((e)=> {
				dispatch(SequencesActions.setStateDefinition(stateId, {}));
				dispatch(SequencesActions.setLastLoadedSuccesfullState(stateId));
			});

		}
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('fetch frame', 'sequences', error));
	}
}

export function* setSelectedFrame({date}) {
	try {
		yield put(SequencesActions.setSelectedDate(date));
		yield put(SequencesActions.fetchFrame(date));
	} catch (error) {
		yield put(DialogActions.showEndpointErrorDialog('select frame', 'sequences', error));
	}
}

export function* initializeSequences() {
	const ifcSpacesHidden = yield select(selectIfcSpacesHidden);
	if (ifcSpacesHidden) {
		yield put(TreeActions.hideIfcSpaces());
	}

	yield put(SequencesActions.setIfcSpacesHidden(ifcSpacesHidden));

	const sequences = (yield select(selectSequences));
	const modelSettings = yield select(selectSettings);
	const areSequencesFromModel = (sequences || [])
		.some((s) => s.model === modelSettings._id || (modelSettings.subModels || []).some((sm) => sm.model === s.model) );

	if (!sequences || !areSequencesFromModel) {
		yield put(SequencesActions.fetchSequences());
		yield take(SequencesTypes.FETCH_SEQUENCES_SUCCESS);
		const date = yield select(selectSelectedDate);

		if (date) {
			yield put(SequencesActions.setSelectedFrame(date));
		}
	}
}

export function* restoreIfcSpacesHidden() {
	const ifcSpacesHidden = yield select(selectIfcSpacesHidden);
	const ifcSpacesHiddenSaved =  yield select(selectIfcSpacesHiddenSaved);

	if (ifcSpacesHiddenSaved !== ifcSpacesHidden) {
		yield put(TreeActions.hideIfcSpaces());
	}
}

export function* setSelectedSequence({ sequenceId }) {
	yield put(SequencesActions.fetchTasksDefinitions(sequenceId));
	yield put(SequencesActions.setSelectedSequenceSuccess(sequenceId));
}

export default function* SequencesSaga() {
	yield takeLatest(SequencesTypes.FETCH_SEQUENCES, fetchSequences);
	yield takeLatest(SequencesTypes.SET_SELECTED_FRAME, setSelectedFrame);
	yield takeLatest(SequencesTypes.INITIALIZE_SEQUENCES, initializeSequences);
	yield takeLatest(SequencesTypes.FETCH_FRAME, fetchFrame);
	yield takeLatest(SequencesTypes.RESTORE_IFC_SPACES_HIDDEN, restoreIfcSpacesHidden);
	yield takeLatest(SequencesTypes.FETCH_TASKS_DEFINITIONS, fetchTasksDefinitions);
	yield takeLatest(SequencesTypes.SET_SELECTED_SEQUENCE, setSelectedSequence);
}
