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

export const PRESET_VIEW = {
	TOP: 'top',
	BOTTOM: 'bottom',
	FRONT: 'front',
	BACK: 'back',
	LEFT: 'LEFT',
	RIGHT: 'RIGHT'
};

export const DEFAULT_VIEWPOINTS = [
	{
		_id: 'default_1',
		name: 'Top Down',
		preset: PRESET_VIEW.TOP
	},
	{
		_id: 'default_2',
		name: 'Bottom Up',
		preset: PRESET_VIEW.BOTTOM
	},
	{
		_id: 'default_3',
		name: 'Front View',
		preset: PRESET_VIEW.FRONT
	},
	{
		_id: 'default_4',
		name: 'Back View',
		preset: PRESET_VIEW.BACK
	},
	{
		_id: 'default_5',
		name: 'Side View (Left)',
		preset: PRESET_VIEW.LEFT
	},
	{
		_id: 'default_6',
		name: 'Side View (Right)',
		preset: PRESET_VIEW.RIGHT
	}
];
