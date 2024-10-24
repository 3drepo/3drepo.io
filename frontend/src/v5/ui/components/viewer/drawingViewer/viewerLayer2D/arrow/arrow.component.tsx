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

import { mapValues } from 'lodash';
import { Svg } from './arrow.styles';
import { Coord2D } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.types';

type ArrowProps = { start: Coord2D, end: Coord2D, scale: number };
export const Arrow = ({ start, end, scale }: ArrowProps) => {
	const [x1, y1] = start;
	const [x2, y2] = end;
	const dx = x2 - x1;
	const dy = y2 - y1;
	const angle = Math.atan2(dy, dx);
	const perpedicularAngle = (Math.PI / 2) + angle;

	const measures = mapValues({
		arrowWidth: 2,
		arrowHeadLength: 11,
		arrowHeadHalfWidth: 6,
		circleRadius: 6,
	}, (val) => val / scale);

	const length = Math.hypot(dx, dy);
	const desiredLength = Math.max(length - measures.arrowHeadLength, 0);

	const arrowHeaderX1 = x1 + (Math.cos(angle) * desiredLength);
	const arrowHeaderY1 = y1 + (Math.sin(angle) * desiredLength);

	return (
		<Svg
			xmlns="http://www.w3.org/2000/svg"
			version="1.1"
			xmlnsXlink="http://www.w3.org/1999/xlink"
		>
			{/* Arrow head */}
			<polygon
				points={`
					${arrowHeaderX1 + (Math.cos(perpedicularAngle) * measures.arrowHeadHalfWidth)}
					${arrowHeaderY1 + (Math.sin(perpedicularAngle) * measures.arrowHeadHalfWidth)},
					${x2} ${y2},
					${arrowHeaderX1 - (Math.cos(perpedicularAngle) * measures.arrowHeadHalfWidth)}
					${arrowHeaderY1 - (Math.sin(perpedicularAngle) * measures.arrowHeadHalfWidth)}
				`}
				strokeWidth={0}
			/>
			{/* Arrow line */}
			<line
				x1={x1}
				y1={y1}
				x2={arrowHeaderX1}
				y2={arrowHeaderY1}
				strokeWidth={measures.arrowWidth}
			/>
			{/* Base */}
			<circle cx={x1} cy={y1} r={measures.circleRadius} strokeWidth={0} />
		</Svg>
	);
};
