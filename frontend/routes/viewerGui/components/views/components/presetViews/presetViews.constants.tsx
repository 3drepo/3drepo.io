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

import React from 'react';

import { PRESET_VIEW } from '../../../../../../modules/viewpoints/viewpoints.constants';

const PRESET_VIEW_ICONS = {
	[PRESET_VIEW.BACK]: () => (
		<>
			<g className="wall">
				<rect x="75.7" y="4" width="248.3" height="248.3" />
				<line className="stroke-dash" x1="3.3" y1="354" x2="74.5" y2="252.3" />
				<line className="stroke-dash" x1="74.5" y1="252.3" x2="322.8" y2="252.3" />
				<line className="stroke-dash" x1="74.5" y1="4" x2="74.5" y2="252.3" />
			</g>
			<g className="cube">
				<polyline points="252.8 354 252.8 105.7 324 4 252.8 105.7 4.5 105.7" />
				<polygon points="75.7 4 4.5 105.7 4.5 354 252.8 354 324 252.3 324 4 75.7 4" />
			</g>
		</>
	),
	[PRESET_VIEW.BOTTOM]: () => (
		<>
			<g className="wall">
				<polygon points="4.5 354 75.7 252.3 324 252.3 252.8 354 4.5 354" />
				<line className="stroke-dash" x1="3.3" y1="354" x2="74.5" y2="252.3" />
				<line className="stroke-dash" x1="74.5" y1="252.3" x2="322.8" y2="252.3" />
				<line className="stroke-dash" x1="74.5" y1="4" x2="74.5" y2="252.3" />
			</g>
			<g className="cube">
				<polyline points="252.8 354 252.8 105.7 324 4 252.8 105.7 4.5 105.7" />
				<polygon points="75.7 4 4.5 105.7 4.5 354 252.8 354 324 252.3 324 4 75.7 4" />
			</g>
		</>
	),
	[PRESET_VIEW.TOP]: () => (
		<>
			<g className="wall">
				<polygon points="4 105.7 252.3 105.7 323.5 4 75.2 4 4 105.7" />
			</g>
			<g className="cube">
				<polyline points="252.3 354 252.3 105.7 323.5 4 252.3 105.7 4 105.7" />
				<polygon points="75.2 4 4 105.7 4 354 252.3 354 323.5 252.3 323.5 4 75.2 4" />
			</g>
		</>
	),
	[PRESET_VIEW.FRONT]: () => (
		<>
			<g className="wall">
				<rect x="1.5" y="105.7" width="248.3" height="248.3" />
			</g>
			<g className="cube">
				<polyline points="252.3 354 252.3 105.7 323.5 4 252.3 105.7 4 105.7" />
				<polygon points="75.2 4 4 105.7 4 354 252.3 354 323.5 252.3 323.5 4 75.2 4" />
			</g>
		</>
	),
	[PRESET_VIEW.FRONT]: () => (
		<>
			<g className="wall">
				<rect x="1.5" y="105.7" width="248.3" height="248.3" />
			</g>
			<g className="cube">
				<polyline points="252.3 354 252.3 105.7 323.5 4 252.3 105.7 4 105.7" />
				<polygon points="75.2 4 4 105.7 4 354 252.3 354 323.5 252.3 323.5 4 75.2 4" />
			</g>
		</>
	),
	[PRESET_VIEW.LEFT]: () => (
		<>
			<g className="wall">
				<polygon points="4 354 75.2 252.3 75.2 4 4 105.7 4 354" />
				<line className="stroke-dash" x1="4" y1="354" x2="75.2" y2="252.3" />
				<line className="stroke-dash" x1="75.2" y1="252.3" x2="323.5" y2="252.3" />
				<line className="stroke-dash" x1="75.2" y1="4" x2="75.2" y2="252.3" />
			</g>
			<g className="cube">
				<polyline points="252.3 354 252.3 105.7 323.5 4 252.3 105.7 4 105.7" />
				<polygon points="75.2 4 4 105.7 4 354 252.3 354 323.5 252.3 323.5 4 75.2 4" />
			</g>
		</>
	),
	[PRESET_VIEW.RIGHT]: () => (
		<>
			<g className="wall">
				<polygon points="252.3 354 252.3 105.7 323.5 4 323.5 252.3 252.3 354" />
			</g>
			<g className="cube">
				<polyline points="252.3 354 252.3 105.7 323.5 4 252.3 105.7 4 105.7" />
				<polygon points="75.2 4 4 105.7 4 354 252.3 354 323.5 252.3 323.5 4 75.2 4" />
			</g>
		</>
	),
};

export const DEFAULT_VIEWPOINTS = [
	{
		_id: 'default_3',
		name: 'Front View',
		preset: PRESET_VIEW.FRONT,
		icon: PRESET_VIEW_ICONS[PRESET_VIEW.FRONT],
		viewBox: '0 0 327.5 358',
	},
	{
		_id: 'default_4',
		name: 'Back View',
		preset: PRESET_VIEW.BACK,
		icon: PRESET_VIEW_ICONS[PRESET_VIEW.BACK],
		viewBox: '0 0 328 358',
	},
	{
		_id: 'default_5',
		name: 'Side View (Left)',
		preset: PRESET_VIEW.LEFT,
		icon: PRESET_VIEW_ICONS[PRESET_VIEW.LEFT],
		viewBox: '0 0 327.5 358',
	},
	{
		_id: 'default_6',
		name: 'Side View (Right)',
		preset: PRESET_VIEW.RIGHT,
		icon: PRESET_VIEW_ICONS[PRESET_VIEW.RIGHT],
		viewBox: '0 0 327.5 358',
	},
	{
		_id: 'default_1',
		name: 'Top Down',
		preset: PRESET_VIEW.TOP,
		icon: PRESET_VIEW_ICONS[PRESET_VIEW.TOP],
		viewBox: '0 0 327.5 358',
	},
	{
		_id: 'default_2',
		name: 'Bottom Up',
		preset: PRESET_VIEW.BOTTOM,
		icon: PRESET_VIEW_ICONS[PRESET_VIEW.BOTTOM],
		viewBox: '0 0 328 358',
	},
];
