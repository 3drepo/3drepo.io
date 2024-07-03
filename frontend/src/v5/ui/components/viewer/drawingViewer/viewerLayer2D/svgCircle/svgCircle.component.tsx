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
import { Circle, Svg } from './svgCircle.styles';
import { Coord2D } from '@/v5/store/calibration/calibration.types';

type SvgCircleProps = { coord: Coord2D, scale: number };
export const SvgCircle = ({ coord, scale }: SvgCircleProps) => {
	const measures = mapValues({
		strokeWidth: 1,
		radius: 3,
	}, (val) => val / scale);
	return (
		<Svg
			xmlns="http://www.w3.org/2000/svg"
			version="1.1"
			xmlnsXlink="http://www.w3.org/1999/xlink"
		>
			<Circle
				cx={coord[0] + measures.strokeWidth / 2}
				cy={coord[1] + measures.strokeWidth / 2}
				r={measures.radius}
				strokeWidth={measures.strokeWidth}
			/>
		</Svg>
	);
};
