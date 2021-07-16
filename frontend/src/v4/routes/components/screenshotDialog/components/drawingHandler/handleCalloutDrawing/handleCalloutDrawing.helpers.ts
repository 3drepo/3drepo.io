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

import { isEmpty } from 'lodash';

import { linesIntersection } from '../../../../../../helpers/linesIntersections';

const getRectLines = ({ x, y, width, height }) => {
	return [
		{ x1: x, y1: y, x2: x + width, y2: y },
		{ x1: x, y1: y, x2: x, y2: y + height },
		{ x1: x, y1: y + height, x2: x + width, y2: y + height },
		{ x1: x + width, y1: y, x2: x + width, y2: y + height },
	];
};

const getRectIntersection = (rect, drawnLine): any => {
	const stroke = rect.strokeWidth();
	const isNegativeHeight = rect.height() < 0;
	const isNegativeWidth = rect.width() < 0;
	const { x, y, width, height } = rect.getClientRect();
	const lines = getRectLines({
		x: isNegativeWidth ? x - (stroke / 2) : x,
		y: isNegativeHeight ? y - (stroke / 2) : y,
		width: isNegativeWidth ? width + stroke : width,
		height: isNegativeHeight ? height + stroke : height,
	});

	const intersections = lines.reduce((points, line, index, array) => {
		const intersection = linesIntersection({ x: line.x1, y: line.y1 }, { x: line.x2, y: line.y2 },
				{ x: drawnLine[0], y: drawnLine[1] }, { x: drawnLine[2], y: drawnLine[3] });

		if (intersection) {
			return [...points, intersection];
		}

		return [...points];
	}, []);

	return intersections[0];
};

export const getLinePoints = (shapeFrom, shapeTo) => {
	let dx;
	let dy;
	if (shapeFrom.getClassName() === 'Circle') {
		dx = (shapeTo.x() + shapeTo.width() / 2) - shapeFrom.x();
		dy = (shapeTo.y() + shapeTo.height() / 2) - shapeFrom.y();
	} else {
		dx = (shapeTo.x() + shapeTo.width() / 2) - (shapeFrom.x() + shapeFrom.width() / 2);
		dy = (shapeTo.y() + shapeTo.height() / 2) - (shapeFrom.y() + shapeFrom.height() / 2);
	}
	const angle = Math.atan2(-dy, dx);
	const radiusFrom = shapeFrom.attrs.radius;

	let pointsFrom = [];
	let pointsTo = [];

	if (shapeFrom.getClassName() === 'Circle') {
		pointsFrom = [
			shapeFrom.x() + -radiusFrom * Math.cos(angle + Math.PI),
			shapeFrom.y() + radiusFrom * Math.sin(angle + Math.PI),
		];
	} else if (shapeFrom.getClassName() === 'Rect') {
		pointsFrom = [
			shapeFrom.x() + shapeFrom.width() / 2,
			shapeFrom.y() + shapeFrom.height() / 2,
		];
	}

	if (angle <= 0.75 && angle >= -0.75) {
		pointsTo = [
			shapeTo.x(),
			shapeTo.y() + shapeTo.height() / 2,
		];
	} else if (angle > 0.75 && angle <= 2.25) {
		pointsTo = [
			shapeTo.x() + shapeTo.width() / 2,
			shapeTo.y() + shapeTo.height(),
		];
	} else if (angle < -0.75 && angle >= -2.25) {
		pointsTo = [
			shapeTo.x() + shapeTo.width() / 2,
			shapeTo.y(),
		];
	} else {
		pointsTo = [
			shapeTo.x() + shapeTo.width(),
			shapeTo.y() + shapeTo.height() / 2,
		];
	}

	if (shapeFrom.getClassName() === 'Rect') {
		const intersectionPoint = getRectIntersection(shapeFrom, [...pointsFrom, ...pointsTo]);
		if (!isEmpty(intersectionPoint) && intersectionPoint.x && intersectionPoint.y) {
			pointsFrom = [intersectionPoint.x, intersectionPoint.y];
		} else {
			return null;
		}
	}

	return [...pointsFrom, ...pointsTo];
};
