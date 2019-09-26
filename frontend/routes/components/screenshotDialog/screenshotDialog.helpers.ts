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

import { SHAPE_TYPES } from './components/shape/shape.constants';
import { COLOR } from '../../../styles';

export const MODES = {
	BRUSH: 'brush',
	ERASER: 'eraser',
	TEXT: 'text',
	SHAPE: 'shape'
};

export const INITIAL_VALUES = {
	color: COLOR.PRIMARY_DARK,
	brushColor: COLOR.PRIMARY_DARK,
	brushSize: 5,
	mode: MODES.BRUSH
};

export const MODE_OPERATION = {
	brush: 'source-over',
	eraser: 'destination-out'
};

export const ELEMENT_TYPES = {
	TEXT: 'text',
	SHAPE: 'shape',
	DRAWING: 'drawing'
};

const createUniqueName = (type) => `${type}-${(Number(String(Math.random()).slice(2)) + Date.now()).toString(36)}`;

export const getNewShape = (stage, figure, color) => {
	const name = createUniqueName(ELEMENT_TYPES.SHAPE);
	const newShape = {
		type: ELEMENT_TYPES.SHAPE,
		figure,
		name,
		width: 200,
		height: 200,
		color,
		x: stage.attrs.width / 2 - 200 / 2,
		y: stage.attrs.height / 2 - 50,
		rotation: 0,
		fill: 'transparent'
	};

	if (figure === SHAPE_TYPES.LINE) {
		newShape.height = 0;
		newShape.width = 300;
	} else if (figure === SHAPE_TYPES.CLOUD) {
		newShape.height = 150;
		newShape.width = 264;
	}

	return newShape;
};

export const getNewDrawnLine = (lineAttrs, color) => {
	const name = createUniqueName(ELEMENT_TYPES.DRAWING);
	const newLine = {
		type: ELEMENT_TYPES.DRAWING,
		name,
		stroke: color,
		rotation: 0,
		points: lineAttrs.points,
		lineCap: lineAttrs.lineCap,
		strokeWidth: lineAttrs.strokeWidth,
		x: 0,
		y: 0
	};

	return newLine;
};

export const getNewText = (stage, color) => {
	const name = createUniqueName(ELEMENT_TYPES.TEXT);
	const newText = {
		type: ELEMENT_TYPES.TEXT,
		text: '',
		color,
		name,
		fontSize: 32,
		fontFamily: 'Arial',
		x: stage.attrs.width / 2 - 200 / 2,
		y: stage.attrs.height / 2 - 51.5
	};

	return newText;
};

export const getTextStyles = (target) => {
	const textPosition = target.getAbsolutePosition();
	const styles = {
		color: target.attrs.fill,
		fontSize: target.attrs.fontSize,
		fontFamily: target.attrs.fontFamily,
		width: `${target.width() - target.padding() * 2}px`,
		height: `${target.height() - target.padding() * 2}px`,
		textAlign: target.align(),
		lineHeight: target.lineHeight(),
		top: `${textPosition.y - 2}px`,
		left: `${textPosition.x}px`
	} as any;

	if (target.attrs.rotation) {
		styles.transform = `rotateZ(${target.attrs.rotation}deg)`;
	}

	return styles;
};

export const EDITABLE_TEXTAREA_NAME = 'editable-textarea';
export const EDITABLE_TEXTAREA_PLACEHOLDER = 'Sample text';
