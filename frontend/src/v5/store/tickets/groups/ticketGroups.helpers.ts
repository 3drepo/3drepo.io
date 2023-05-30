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

import { ViewpointGroup, ViewpointState } from '../tickets.types';

const smartGroup: ViewpointGroup = {
	_id: 'a2045aa0-d9d1-11ed-8443-77f52ace17bf',
	name: 'Untitled group 1 but with a very long name12345',
	objects: [{
		container: '134a7cb0-d916-11ed-bc43-5ba0d73424c9',
		_ids: ['134a7cb0-d916-11ed-bc43-5ba0d73424c9'],
	}],
	rules: [{
		field: 'Absorptance',
		operator: 'IS_NOT',
		values: ['2'],
	}],
};

const normalGroups: ViewpointGroup[] = [
	{
		_id: '59115750-ddf8-11ed-84f4-8d3c6f6ad8c6',
		name: 'opacity 1',
		objects: [{
			container: '134a7cb0-d916-11ed-bc43-5ba0d73424c9',
			_ids: ['134a7cb0-d916-11ed-bc43-5ba0d73424c9'],
		}],
	},
	{
		_id: '114035e0-de89-11ed-8a9c-23f681ce1274',
		name: 'opacity 0.5',
		description: 'this group has color, opacity, and a description',
		objects: [{
			container: '134a7cb0-d916-11ed-bc43-5ba0d73424c9',
			_ids: ['134a7cb0-d916-11ed-bc43-5ba0d73424c9'],
		}],
	},
	{
		_id: '1d345c50-de89-11ed-8a9c-23f681ce1274',
		name: 'opacity 0.01',
		objects: [{
			container: '134a7cb0-d916-11ed-bc43-5ba0d73424c9',
			_ids: ['134a7cb0-d916-11ed-bc43-5ba0d73424c9'],
		}],
	},
];

export const MOCK_DATA: ViewpointState = {
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
			prefix: ['____ROOT', 'level 1', 'level 2'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT', 'level 1'],
		},
		{
			color: [1, 230, 255],
			group: smartGroup,
			prefix: ['____ROOT', 'level 1', 'level 2', 'level 3'],
		},
		{
			opacity: .3,
			group: {
				_id: '1d345c50-de89-11ed-8a9c-23f681ce1274',
				name: 'opacity 0.01',
				objects: [],
			},
		}
	],
	hidden: [{
		group: smartGroup,
	}],
};
