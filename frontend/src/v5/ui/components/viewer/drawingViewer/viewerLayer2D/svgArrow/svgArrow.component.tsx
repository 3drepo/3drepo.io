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

import { Svg, CrossLine } from './svgArrow.styles';

export type Offset = [number, number];

const ARROW_WIDTH = 5;
const ARROW_HEAD_LENGTH = 25;
const ARROW_HEAD_HALF_WIDTH = 14;
const CIRCLE_RADIUS = 14;
const CIRLE_LINE_WIDTH = 1;
const CIRLE_LINE_HALF_LENGTH = CIRCLE_RADIUS - 2;
export const SvgArrow = ({ start, end }: { start: Offset, end: Offset }) => {
	const [x1, y1] = start;
	const [x2, y2] = end;
	const dx = x2 - x1;
	const dy = y2 - y1;
	const angle = Math.atan2(dy, dx);
	const perpedicularAngle = (Math.PI / 2) + angle;

	const length = Math.hypot(dx, dy);
	const desiredLength = Math.max(length - ARROW_HEAD_LENGTH, 0);

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
					${arrowHeaderX1 + (Math.cos(perpedicularAngle) * ARROW_HEAD_HALF_WIDTH)}
					${arrowHeaderY1 + (Math.sin(perpedicularAngle) * ARROW_HEAD_HALF_WIDTH)},
					${x2} ${y2},
					${arrowHeaderX1 - (Math.cos(perpedicularAngle) * ARROW_HEAD_HALF_WIDTH)}
					${arrowHeaderY1 - (Math.sin(perpedicularAngle) * ARROW_HEAD_HALF_WIDTH)}
				`}
			/>
			{/* Arrow line */}
			<line
				x1={x1}
				y1={y1}
				x2={arrowHeaderX1}
				y2={arrowHeaderY1}
				strokeWidth={ARROW_WIDTH}
			/>
			{/* Base */}
			<circle cx={x1} cy={y1} r={CIRCLE_RADIUS} />
			<CrossLine
				x1={x1 + CIRLE_LINE_HALF_LENGTH}
				y1={y1}
				x2={x1 - CIRLE_LINE_HALF_LENGTH}
				y2={y1}
				strokeWidth={CIRLE_LINE_WIDTH}
			/>
			<CrossLine
				x1={x1}
				y1={y1 + CIRLE_LINE_HALF_LENGTH}
				x2={x1}
				y2={y1 - CIRLE_LINE_HALF_LENGTH}
				strokeWidth={CIRLE_LINE_WIDTH}
			/>
		</Svg>
	);
};
