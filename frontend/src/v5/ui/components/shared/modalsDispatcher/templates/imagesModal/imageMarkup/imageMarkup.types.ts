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

import { ELEMENT_TYPES, MODES } from '@/v4/routes/components/screenshotDialog/markupStage/markupStage.helpers';
import { MODE_OPERATION } from '@/v4/routes/components/screenshotDialog/screenshotDialog.helpers';
import { ValuesOf } from '@/v5/helpers/types.helpers';

export type ISize = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type IMode = ValuesOf<typeof MODES>;
export type IDimension = { width: number, height: number };
export type IModeOperation = ValuesOf<typeof MODE_OPERATION>;
export type IElementType = ValuesOf<typeof ELEMENT_TYPES>;

export const STROKE_WIDTH = {
	XS: 1,
	S: 3,
	M: 6,
	L: 14,
	XL: 26,
} as const;
export type IStrokeWidth = ValuesOf<typeof STROKE_WIDTH>;

export const FONT_SIZE = {
	XS: 14,
	S: 18,
	M: 24,
	L: 36,
	XL: 46,
} as const;
export type IFontSize = ValuesOf<typeof FONT_SIZE>;

export const SHAPES = {
	RECTANGLE: 1,
	TRIANGLE: 2,
	CIRCLE: 3,
	LINE: 4,
	CLOUD: 5,
	ARROW: 6,
	POLYGON: 7,
} as const;
export type IShapeType = ValuesOf<typeof SHAPES>;

export const CALLOUTS = {
	DOT: 8,
	CIRCLE: 9,
	RECTANGLE: 10,
} as const;
export type ICalloutType = ValuesOf<typeof CALLOUTS>;
