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

import { MODE_OPERATION } from '../../screenshotDialog.helpers';
import { SHAPE_TYPES } from '../shape/shape.constants';
import { cloud } from '../shape/shape.helpers';

declare const Konva;

const circleProps = { radius: 1 };
const triangleProps = { sides: 3 };
const rectangleProps = { height: 1, width: 1 };

const cloudProps = {
	data: cloud.path,
	scaleX: 0,
	scaleY: 0
};

export const createShape = (shapeType, commonProps, initialPositionProps) => {
	const map = {
		[SHAPE_TYPES.CIRCLE]: new Konva.Circle({
			...circleProps,
			...commonProps,
			...initialPositionProps,
		}),
		[SHAPE_TYPES.TRIANGLE]: new Konva.RegularPolygon({
			...commonProps,
			...initialPositionProps,
			...triangleProps,
		}),
		[SHAPE_TYPES.RECTANGLE]: new Konva.Rect({
			...commonProps,
			...initialPositionProps,
			...rectangleProps,
		}),
		[SHAPE_TYPES.LINE]: new Konva.Line({
			...commonProps,
		}),
		[SHAPE_TYPES.CLOUD]: new Konva.Path({
			...commonProps,
			...initialPositionProps,
			...cloudProps,
		}),
		[SHAPE_TYPES.ARROW]: new Konva.Arrow({
			...commonProps,
		})
	};

	return map[shapeType];
};

export const createDrawnLine = (stroke, strokeWidth, position, mode, draggable = true) => {
	return new Konva.Line({
		stroke,
		strokeWidth,
		points: [position.x, position.y],
		lineCap: 'round',
		globalCompositeOperation: MODE_OPERATION[mode],
		draggable,
	});
};

export const getDrawFunction = (shapeType, shape, initialPos, currentPos) => {
	const distance = Math.hypot(initialPos.x - currentPos.x, initialPos.y - currentPos.y);
	const map = {
		[SHAPE_TYPES.CIRCLE]: () => {
			shape.radius(distance);
		},
		[SHAPE_TYPES.TRIANGLE]: () => {
			shape.radius(distance);
		},
		[SHAPE_TYPES.RECTANGLE]: () => {
			shape.height(currentPos.y - initialPos.y);
			shape.width(currentPos.x - initialPos.x);
		},
		[SHAPE_TYPES.LINE]: () => {
			shape.points([initialPos.x, initialPos.y, currentPos.x, currentPos.y]);
		},
		[SHAPE_TYPES.CLOUD]: () => {
			const scaleX = Math.abs(initialPos.x - currentPos.x) / cloud.width;
			const scaleY = Math.abs(initialPos.y - currentPos.y) / cloud.height;

			shape.strokeScaleEnabled(false);
			shape.scale({
				x: currentPos.x > initialPos.x ? scaleX : -scaleX,
				y: currentPos.y > initialPos.y ? scaleY : -scaleY
			});
		},
		[SHAPE_TYPES.ARROW]: () => {
			shape.points([initialPos.x, initialPos.y, currentPos.x, currentPos.y]);
		},
	};

	return map[shapeType];
};
