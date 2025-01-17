/**
 *  Copyright (C) 2017 3D Repo Ltd
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

export const MODES = {
	BRUSH: 'brush',
	ERASER: 'eraser',
	TEXT: 'text',
	SHAPE: 'shape',
	POLYGON: 'polygon',
	CALLOUT: 'callout',
};

export const ELEMENT_TYPES = {
	TEXT: 'text',
	SHAPE: 'shape',
	DRAWING: 'drawing',
	POLYGON: 'polygon',
};

const createUniqueName = (type) => `${type}-${(Number(String(Math.random()).slice(2)) + Date.now()).toString(36)}`;

export const getNewShape = (figure, color, attrs) => {
	const name = createUniqueName(ELEMENT_TYPES.SHAPE);
	const newShape = {
		type: ELEMENT_TYPES.SHAPE,
		figure,
		name,
		color,
		rotation: 0,
		fill: 'transparent',
		...attrs
	};

	return newShape;
};

export const getNewDrawnLine = (lineAttrs, color, type = ELEMENT_TYPES.DRAWING) => {
	const name = createUniqueName(type);
	const newLine = {
		type: ELEMENT_TYPES.DRAWING,
		name,
		color,
		rotation: 0,
		points: lineAttrs.points,
		lineCap: lineAttrs.lineCap,
		strokeWidth: lineAttrs.strokeWidth,
		globalCompositeOperation: lineAttrs.globalCompositeOperation,
		x: 0,
		y: 0
	};

	return newLine;
};

export const getNewText = (color, size, position, text, width?) => {
	const name = createUniqueName(ELEMENT_TYPES.TEXT);
	const newText = {
		type: ELEMENT_TYPES.TEXT,
		text,
		color,
		name,
		width,
		fontFamily: 'Arial',
		fontSize: size,
		...position
	};

	return newText;
};
