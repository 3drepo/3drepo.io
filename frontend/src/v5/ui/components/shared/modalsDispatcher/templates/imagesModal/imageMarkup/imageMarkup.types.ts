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

import { SHAPE_TYPES } from '@/v4/routes/components/screenshotDialog/components/shape/shape.constants';
import { ELEMENT_TYPES, MODES } from '@/v4/routes/components/screenshotDialog/markupStage/markupStage.helpers';
import { MODE_OPERATION } from '@/v4/routes/components/screenshotDialog/screenshotDialog.helpers';

export type ValuesOf<T> = T[keyof T];

export type ISize = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type IMode = ValuesOf<typeof MODES>;
export type IShapeType = ValuesOf<typeof SHAPE_TYPES>;
export type IDimension = { width: number, height: number };
export type IModeOperation = ValuesOf<typeof MODE_OPERATION>;
export type IElementType = ValuesOf<typeof ELEMENT_TYPES>;

export const STROKE_WIDTH = {
	XL: 26,
	L: 14,
	M: 6,
	S: 3,
	XS: 1,
} as const;
export type IStrokeWidth = ValuesOf<typeof STROKE_WIDTH>;

export const FONT_SIZE = {
	XL: 46,
	L: 36,
	M: 24,
	S: 18,
	XS: 14,
} as const;
export type IFontSize = ValuesOf<typeof FONT_SIZE>;

export type IMarkupForm = {
	color: string,
	strokeWidth: IStrokeWidth,
	fontSize: IFontSize,
	mode: IMode,
	activeShape: IShapeType,
	sourceImage: string,
	stage: IDimension,
	container: IDimension,
	selectedObjectName: string,
};
