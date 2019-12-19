/**
 *  Copyright (C) 2019 3D Repo Ltd
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

export const getLinePoints = (shapeFrom, shapeTo) => {
	const isNegativeHeight = shapeFrom.height() < 0;
	const isNegativeWidth = shapeFrom.width() < 0;
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
	} else {
		if (angle <= 0.75 && angle >= -0.75) {
			pointsFrom = [
				isNegativeWidth ? shapeFrom.x() : shapeFrom.x() + shapeFrom.width(),
				shapeFrom.y() + shapeFrom.height() / 2,
			];
		} else if (angle > 0.75 && angle <= 2.25) {
			pointsFrom = [
				shapeFrom.x() + shapeFrom.width() / 2,
				isNegativeHeight ? shapeFrom.y() + shapeFrom.height() : shapeFrom.y(),
			];
		} else if (angle < -0.75 && angle >= -2.25) {
			pointsFrom = [
				shapeFrom.x() + shapeFrom.width() / 2,
				isNegativeHeight ? shapeFrom.y() : shapeFrom.y() + shapeFrom.height(),
			];
		} else {
			pointsFrom = [
				isNegativeWidth ? shapeFrom.x() + shapeFrom.width() : shapeFrom.x(),
				shapeFrom.y() + shapeFrom.height() / 2,
			];
		}
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

	return [ ...pointsFrom, ...pointsTo];
};
