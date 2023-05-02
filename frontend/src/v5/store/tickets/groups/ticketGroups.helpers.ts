/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { IGroupFromApi, IViewState } from './ticketGroups.types';

const smartGroup: IGroupFromApi = {
	_id: 'a2045aa0-d9d1-11ed-8443-77f52ace17bf',
	name: 'Untitled group 1 but with a very long name12345',
	objects: [{
		container: '134a7cb0-d916-11ed-bc43-5ba0d73424c9',
	}],
	rules: [{
		field: 'Absorptance',
		operator: 'IS_NOT',
		values: ['2'],
	}],
};

const normalGroups: IGroupFromApi[] = [
	{
		_id: '59115750-ddf8-11ed-84f4-8d3c6f6ad8c6',
		name: 'opacity 1',
		objects: [{
			container: '134a7cb0-d916-11ed-bc43-5ba0d73424c9',
		}],
	},
	{
		_id: '114035e0-de89-11ed-8a9c-23f681ce1274',
		name: 'opacity 0.5',
		objects: [{
			container: '134a7cb0-d916-11ed-bc43-5ba0d73424c9',
		}],
	},
	{
		_id: '1d345c50-de89-11ed-8a9c-23f681ce1274',
		name: 'opacity 0.01',
		objects: [{
			container: '134a7cb0-d916-11ed-bc43-5ba0d73424c9',
		}],
	},
];

export const MOCK_DATA: IViewState = {
	showDefaultHidden: true,
	colored: [
		{
			opacity: 1,
			group: normalGroups[0],
		},
		{
			opacity: 1,
			group: normalGroups[0],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['_____VERY LOOOOOOOOONG NAME FOR A GROUP INNIT?'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT'],
		},
		{
			opacity: 0.01,
			color: [1, 230, 255],
			group: normalGroups[2],
			prefix: ['root', 'leaf'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT', 're'],
		},
		{
			opacity: 0.5,
			color: [1, 230, 255],
			group: normalGroups[1],
			prefix: ['root'],
		},
		{
			opacity: 0.5,
			color: [1, 230, 255],
			group: normalGroups[1],
			prefix: ['root'],
		},
		{
			opacity: 0.01,
			color: [1, 230, 255],
			group: normalGroups[2],
			prefix: ['root', 'leaf'],
		},
		{
			opacity: 0.01,
			color: [1, 230, 255],
			group: normalGroups[2],
			prefix: ['root', 'leaf2 has a very looooooooooooooooooooooong'],
		},
	],
	hidden: [{
		group: smartGroup,
	}],
};
