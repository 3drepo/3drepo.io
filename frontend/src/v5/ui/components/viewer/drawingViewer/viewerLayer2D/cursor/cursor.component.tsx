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
import { Coord2D } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.types';
import { SnapType } from '../../snapping/types';
import { CursorEdge, CursorIntersection, CursorNode, CursorNone } from './cursor.styles';


const CursorIcon = {
	[SnapType.NONE]: CursorNone,
	[SnapType.NODE]: CursorNode,
	[SnapType.INTERSECTION]: CursorIntersection,
	[SnapType.EDGE]: CursorEdge,
};

type CursorProps = { coord: Coord2D, scale: number, snapType: SnapType };
export const Cursor = ({ coord, scale, snapType }: CursorProps) => {
	const Cursor = CursorIcon[snapType];

	return (
		<Cursor
			transform={`
				translate(${coord[0]} ${coord[1]})
				scale(${1/scale})
			`}
			
			transform-origin="50% 50%"
			/>
	);
};
