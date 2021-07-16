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

import { Arrow, Circle, Cloud, Line, Rectangle, Triangle } from './shape.helpers';

export const SHAPE_TYPES = {
	RECTANGLE: 1,
	TRIANGLE: 2,
	CIRCLE: 3,
	LINE: 4,
	CLOUD: 5,
	ARROW: 6,
	POLYGON: 7,
	CALLOUT_DOT: 8,
	CALLOUT_CIRCLE: 9,
	CALLOUT_RECTANGLE: 10,
};

export const SHAPE_COMPONENTS = {
	[SHAPE_TYPES.RECTANGLE]: Rectangle,
	[SHAPE_TYPES.TRIANGLE]: Triangle,
	[SHAPE_TYPES.CIRCLE]: Circle,
	[SHAPE_TYPES.LINE]: Line,
	[SHAPE_TYPES.CLOUD]: Cloud,
	[SHAPE_TYPES.ARROW]: Arrow,
};
