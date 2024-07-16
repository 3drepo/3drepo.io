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

import { AxiosResponse } from 'axios';
import { Role } from '../currentUser/currentUser.types';
import { uuid } from '@/v4/helpers/uuid';

// ! This is a temporary file to house functions and objects for the purpose of spoofing the backend for Drawings permissions
// ! When the backend is introduced this file should be deleted.
// ! Other pieces of code that should be reverted or otherwise readdressed will be labeled with the following comment:
// TODO #4789

export const drawingIds = [
	'53da2fd9-draw-4030-a0b5-00de693dd0e5',
	'c7327b8c-draw-4391-afd0-5b5252400d1c',
	'8d4d07ac-draw-4013-ad09-8e5e65c55bef',
	'10aca284-draw-4a8c-9b22-02dcc248313d',
	'dc1844d3-draw-4727-8187-6baef0e70957',
	'95c29f7f-draw-48de-9c93-834d0aa1e614',
	'ece8c912-draw-40bf-9f0c-e8426aae0bd0',
	'a71ddd72-draw-4376-84db-b947b1f9b40a',
	'81716406-draw-44cb-8ae3-6b5d0fa6b74c',
	'7f99b83c-draw-4927-9c41-dc4ad9c88d68',
	'68548605-draw-44b8-8568-75c4baa7f979',
	'ec321904-draw-47d6-8ca2-acb86a48b6dd',
	'40fae82b-draw-425f-b70a-8c6bbfd7bea7',
	'eb8302e8-draw-40ac-8157-ff83fef44216',
	'679d02d5-draw-4cce-acc1-1a95efac5b5a',
	'bf7e9f62-draw-43e1-bb8c-e0c361664d52',
	'aec9935e-draw-43d2-8117-b4eae8a2305a',
	'acb2e432-draw-4088-b2b4-2616fc167711',
	'58cf451a-draw-41ac-8909-f646ab114783',
	'97933311-draw-4178-a241-1fe8219fffb6',
];

// This selects a random role but skips the admin role as this is determined by project settings
export const mockRole = (index) => Role[Object.keys(Role)[(index % 3) + 1]];

const mockDrawingForV4 = (_id, index) => {
	const role = mockRole(index);
	return {
		_id,
		model: _id,
		name: 'A drawing ' + index + ' - ' + role,
		isFavourite: (Math.random() > 0.5),
		role,
		number: uuid(), 
	};
};

export const mockModelPermissions = (modelIds: string[], users) => modelIds.map((model) => ({
	model,
	permissions: users.map(({ user }, index) => ({
		user,
		permission: mockRole(index),
	})),
}));

export const addDrawingsToObject = (object) => {
	const clonedObject = { ...object };
	drawingIds.forEach((drawingId, index) => clonedObject[drawingId] = mockDrawingForV4(drawingId, index));
	return clonedObject;
};

export const appendDrawingsToAxiosResponse = async (resp: Promise<AxiosResponse<any, any>>) => {
	const response = await resp;
	response.data.models = [...response.data.models, ...drawingIds];
	return response;
};
