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

import { COLOR } from '../../../../../../styles';
import { TEXT_SIZE_VALUES } from '../../tools/tools.helpers';

export const updateTextBoxStyles = (shape, pointerPosition, textSize: number) => {
	const PADDINGS = {
		XL: 16,
		L: 12,
		M: 10,
		S: 8,
		XS: 8,
	};
	const BOX_STYLES = {
		[TEXT_SIZE_VALUES.XL]: {
			padding: PADDINGS.XL,
			width: 296 + PADDINGS.XL * 2,
			height: TEXT_SIZE_VALUES.XL + PADDINGS.XL * 2,
		},
		[TEXT_SIZE_VALUES.L]: {
			padding: PADDINGS.L,
			width: 244 + PADDINGS.L * 2,
			height: TEXT_SIZE_VALUES.L + PADDINGS.L * 2,
		},
		[TEXT_SIZE_VALUES.M]: {
			padding: PADDINGS.M,
			width: 190 + PADDINGS.M * 2,
			height: TEXT_SIZE_VALUES.M + PADDINGS.M * 2,
		},
		[TEXT_SIZE_VALUES.S]: {
			padding: PADDINGS.S,
			width: 130 + PADDINGS.S * 2,
			height: TEXT_SIZE_VALUES.S + PADDINGS.S * 2,
		},
		[TEXT_SIZE_VALUES.XS]: {
			padding: PADDINGS.XS,
			width: 108 + PADDINGS.XS * 2,
			height: TEXT_SIZE_VALUES.XS + PADDINGS.XS * 2,
		}
	};

	const properStyles = BOX_STYLES[textSize] || BOX_STYLES[TEXT_SIZE_VALUES.M];

	shape.x(pointerPosition.x - properStyles.padding);
	shape.y(pointerPosition.y - properStyles.padding);
	shape.width(properStyles.width);
	shape.height(properStyles.height);
	shape.fill(COLOR.WHITE);
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
	} else {
		if (angle <= 0.75 && angle >= -0.75) {
			pointsFrom = [
				shapeFrom.x(),
				shapeFrom.y() + shapeFrom.height() / 2,
			];
		} else if (angle > 0.75 && angle <= 2.25) {
			pointsFrom = [
				shapeFrom.x() + shapeFrom.width() / 2,
				shapeFrom.y()
			];
		} else if (angle < -0.75 && angle >= -2.25) {
			pointsFrom = [
				shapeFrom.x() + shapeFrom.width() / 2,
				shapeFrom.y() + shapeFrom.height(),
			];
		} else {
			pointsFrom = [
				shapeFrom.x() + shapeFrom.width(),
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
